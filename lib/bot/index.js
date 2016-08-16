import os       from 'os';
import startBot from './startBot';

let chilkat;

switch (os.platform()) {
  case 'win32':
    chilkat = require('chilkat_win32');
    break;
  case 'linux':
    if (os.arch() == 'x86') {
      chilkat = require('chilkat_linux32');
    } else {
      chilkat = require('chilkat_linux64');
    }
    break;
  case 'darwin':
    chilkat = require('chilkat_macosx');
    break;
  default:
    chilkat = require('chilkat_macosx');
}

const h2t = new chilkat.HtmlToText();
const success = h2t.UnlockComponent('30-day trial');
if (success !== true) {
  console.error(h2t.LastErrorText);
}

startBot();
