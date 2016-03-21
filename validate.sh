#!/usr/bin/env bash

# Usage:
#

OUT="$1"
CWD="$(pwd)"

if [ -r $1 ]; then

echo 'Validating generated HTML…'
# Validate output HTML
response=$( \
curl -s -H "Content-Type: text/html; charset=utf-8" \
  --data-binary @"$OUT" \
  https://validator.w3.org/nu/?out=gnu \
)

if [[ -z $response ]] ; then
  echo -ne "\033[32;1m✔\033[0m  Validated HTML in $OUT\n"
else
  echo -ne "\033[31;1m✘\033[0m  $OUT is invalid\n"
  echo "$response"
fi


# Copyright 2011 Yu-Jie Lin
# New BSD License
#
# Known bug: &, &ampt;, and &<anything>.

# Modified slightly from <https://bitbucket.org/livibetter/lnkckr/src/tip/linkckr.sh>

# Note on colors: I had to replace \e in the original script with \033
# per <http://apple.stackexchange.com/questions/74777/echo-color-coding-stopped-working-in-mountain-lion>,
# which looks to be OS X-specific.

echo 'Checking links…'
xmllint --shell --html "$OUT" <<<"cat //a[starts-with(@href,'http')]" | egrep -o 'https?:[^"]*' | sort | uniq | # head -1 |
while read url; do
	# curl: -s silent, -I header only, -L follow Location, -m 10 sec timeout, -w output format
	read resp_code eff_url <<<"$(curl -s -I -L -m 10 -w '%{http_code} %{url_effective}\n' "$url" | sed '$q;d')"
	case "$resp_code" in
		2*)
			echo -ne "\033[32;1m"
			;;
		3*)
			echo -ne "\033[34;1m"
			;;
		4*)
			echo -ne "\033[31;1m"
			# TODO 405, should re-check with normal HTTP GET request.
			;;
		5*)
			echo -ne "\033[35;1m"
			;;
		*)
			echo -ne "\033[36;1m"
			;;
	esac
	echo -ne "[${resp_code}]\033[0m $url"
	if [[ "$eff_url" != "$url" ]]; then
		echo -n " -> $eff_url"
	fi
	echo
done

echo 'Validating examples…'

$(npm bin)"/eslint" \
$CWD/examples/*.sjs \
  --no-eslintrc \
  --ext .js \
  --ext .sjs \
  --env es6 \
  --global 'cts,fn,xdmp,sem,require,declareUpdate,module,ValueIterator,Sequence' \
  --rule 'quotes: [2, single]' \
  --rule 'no-unused-expressions: [0]' \
  --rule 'global-strict: [0]' \
  --rule 'no-trailing-spaces: [0]' \
  --rule 'yoda: [2, always, { exceptRange: true }]' \
&& echo -ne "\033[32;1m✔\033[0m  Validated examples/*.[s]js\n"
# --debug

fi

# -g opens in the background
#open -g "$OUT"
#echo "Opening $OUT …"
