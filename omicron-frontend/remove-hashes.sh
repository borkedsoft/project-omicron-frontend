#!/bin/sh
# XXX: remove hashes from built output

find build/static/{css,js} -type f | while read line; do 
	cp "$line" "`echo $line | sed 's/\.[a-f0-9]\{8\}//'`"
done
