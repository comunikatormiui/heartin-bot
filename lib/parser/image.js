import fs         from 'fs';
import getPixels  from 'get-pixels';
import _          from 'lodash';
import easyimg    from 'easyimage';
import config     from '../../config/parse.js';
import eachSeries from 'async/eachSeries';

export default (filename) => {
  return new Promise((resolve, reject) => {
    getPixels(`./${config.dir}/png/${filename}`, (err, pixels) => {
      if (err) {
        console.error('Bad image path');
        reject(err);
      } else {
        if (process.env.DEBUG === 'true') {
          console.log('got pixels', pixels.shape.slice());
        }
        const col1 = Math.floor((pixels.shape[0] / 2) / 2);
        const col2 = Math.floor(((pixels.shape[0] / 2) / 2) + (pixels.shape[0] / 2));
        let currentColumn = col1;
        const images = [];
        for (let i = 0; i < pixels.shape[1]; i++) {
          let num = (i * (pixels.shape[0] * 4)) + (currentColumn * 4);
          let hex = rgbToHex(pixels.data[num], pixels.data[num + 1], pixels.data[num + 2]);
          if (config.colors.indexOf(hex) > -1) {
            let image = {};
            for (let n = currentColumn; n > 0; n--) {
              num = (i * (pixels.shape[0] * 4)) + (n * 4);
              let hexHor = rgbToHex(pixels.data[num], pixels.data[num + 1], pixels.data[num + 2]);
              if (config.colors.indexOf(hexHor) === -1) {
                image.left = n + 1;
                image.top = i;
                break;
              }
            }
            for (let n = i; n < pixels.shape[1]; n++) {
              num = (n * (pixels.shape[0] * 4)) + (image.left * 4);
              let hexVer = rgbToHex(pixels.data[num], pixels.data[num + 1], pixels.data[num + 2]);
              if (config.colors.indexOf(hexVer) === -1) {
                image.bottom = n - 1;
                i = n;
                break;
              }
            }
            for (let n = image.left; n < pixels.shape[0]; n++) {
              num = ((i - 1) * (pixels.shape[0] * 4)) + (n * 4);
              let hexHor = rgbToHex(pixels.data[num], pixels.data[num + 1], pixels.data[num + 2]);
              if (config.colors.indexOf(hexHor) === -1) {
                image.right = n;
                break;
              }
            }
            if (!containsObject(image, images)) {
              images.push(image);
            }
          }
          if ((i === (pixels.shape[1] - 1)) && (currentColumn === col1)) {
            currentColumn = col2;
            i = 0;
          }
        }
        if (process.env.DEBUG === 'true') {
          console.log(images);
        }
        const output = [];
        eachSeries(images, (img, callback) => {
          if (img.bottom - img.top < 100) {
            callback();
          } else {
            const fname = Date.now();
            easyimg.crop({
              src: `./${config.dir}/png/${filename}`, dst: `./${config.dir}/png/${fname}.png`,
              quality: 100,
              gravity: 'NorthWest',
              cropwidth: img.right - img.left, cropheight: img.bottom - img.top,
              x: img.left, y: img.top
            }).then(image => {
              if (process.env.DEBUG === 'true') {
                console.log(`${img.right - img.left} x ${img.bottom - img.top}`);
                console.log(`Cropped: ${image.width}x${image.height}`);
              }
              fs.readFile(`./${config.dir}/png/${fname}.png`, 'binary', (err, data) => {
                let base64Image = new Buffer(data, 'binary').toString('base64');
                output.push(base64Image);
                if (process.env.DEBUG === 'true') {
                  console.log(`./${config.dir}/png/${fname}.png`);
                  console.log(`./${config.dir}/png/${filename}`);
                }
                if (process.env.DEBUG !== 'true') {
                  fs.unlinkSync(`./${config.dir}/png/${fname}.png`);
                }
                callback();
              });
            }, err => {
              console.error(err);
              callback(err);
            });
          }
        }, err => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            if (process.env.DEBUG !== 'true') {
              fs.unlinkSync(`./${config.dir}/png/${filename}`);
            }
            resolve(output);
          }
        });
      }
    });
  });
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255) {
    throw "Invalid color component";
  } else {
    return ((r << 16) | (g << 8) | b).toString(16);
  }
}

function containsObject(obj, list) {
  return list.some(elem => _.isEqual(elem, obj))
}
