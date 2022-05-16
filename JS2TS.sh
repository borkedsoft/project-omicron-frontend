<<<<<<< HEAD
for file in *.js; do mv .js .ts; done
=======
## Use this in cmd line to rename multiple files to TS.

for file in *.ts; do mv "$file" "${file/.js/.tsx }"; done
>>>>>>> 36d71ea (Updated ts to tsx)
