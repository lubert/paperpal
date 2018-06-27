#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const got = require('got');
const program = require('commander');

let filePath;

program
  .version('0.1.0')
  .arguments('[file]')
  .option('--cookie [COOKIE]', 'Cookie added to header')
  .option('--exclude [REGEX]', 'Exclude')
  .option('--url [URL]', 'Base URL prepended to paths')
  .option('--no-check-certificate', 'Ignore SSL certificate errors')
  .action(function(file) {
    filePath = file;
  })
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}

if (!program.checkCertificate) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const rl = readline.createInterface({
  input: fs.createReadStream(filePath)
});

const exclude = program.exclude ? new RegExp(program.exclude, 'g') : null;
const regex = /(?<=GET )[^\s]*/g;

rl.on('line', function(line) {
  if (line.match(exclude)) return;
  const match = line.match(regex);
  if (!match) return;

  let path = match[0];
  if (program.url) path = program.url + path;
  queueRequest(path);
});

let promise = Promise.resolve();

function queueRequest(path) {
  promise = promise.then(() => request(path));
}

const reqOpt = {};
if (program.cookie) {
  reqOpt.headers = {
    cookie: program.cookie
  };
}

function request(path) {
  process.stdout.write(path + ' ');
  const interval = setInterval(function() {
    process.stdout.write('.');
  }, 100);
  return got(path, reqOpt)
  .then(res => {
    clearInterval(interval);
    console.log(' ' + res.statusCode);
  })
  .catch(err => {
    clearInterval(interval);
    console.log(' ' + err.statusCode);
  });
}
