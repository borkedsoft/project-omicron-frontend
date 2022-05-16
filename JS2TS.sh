## Use this in cmd line to rename multiple files to TS.

for file in *.ts; do mv "$file" "${file/.js/.tsx }"; done
