#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const program = require('commander');

let filePath;

program
  .version('0.1.0')
  .arguments('[file]')
  .option('-u, --url [URL]', 'Base URL prepended to paths')
  .action(function(file) {
    filePath = file;
  })
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}

const rl = readline.createInterface({
  input: fs.createReadStream(filePath)
});

const regex = /(?<=GET )[^\s]*/g;

rl.on('line', function(line) {
  const match = line.match(regex);
  if (!match) {
    console.log('Skipping', line);
    return;
  }

  let path = match[0];
  if (program.url) path = program.url + path;
  console.log(path);
});
