import fs         from 'fs';
import request    from 'request-promise';
import download   from 'request';
import cheerio    from 'cheerio';
import eachSeries from 'async/eachSeries';
import htmlparser from 'htmlparser2';
import pdftohtml  from 'pdftohtmljs';
import Cornet     from 'cornet';
import path       from 'path';
import crypto     from 'crypto';
import util       from 'util';

import links      from '../../config/links.js';

const Parser = htmlparser.WritableStream;

eachSeries(links, (link, callback) => {
  console.log(`Processing link ${link}`);
  request(link)
  .then(html => {
    const $ = cheerio.load(html);

    const title = $('meta[name="citation_title"]').attr('content');
    const url = $('meta[name="citation_pdf_url"]').attr('content');

    console.log(title);
    console.log(url);

    const file = crypto.createHash('md5').update(url).digest('hex');

    download(url).pipe(fs.createWriteStream(`${file}.pdf`).on('finish', () => {
      const cornet = new Cornet();
      const converter = new pdftohtml(`${path.join(__dirname, '../../')}${file}.pdf`, `${file}.html`);

      converter.convert('ipad').then(() => {
        console.log(`Success convert`);
        fs.createReadStream(`${file}.html`).pipe(new Parser(cornet));

        const $$ = cheerio;
        let header = '';
        let obj = {
          title,
          url,
          content: []
        };

        cornet.select('#page-container > div', elem => {
          $$(elem).find('.pc > *').each((i, element) => {
            if (element.name === 'div') {
              if ((element.attribs.class.indexOf('fsf') > -1) ||
                  (element.attribs.class.indexOf('fs11') > -1) ||
                  ((element.attribs.class.indexOf('ff1') > -1) &&
                   (element.children[0].data.match(/(\d{1}|\d{1}[a-z]{1})(\.\d{1}){2,3}/ig) !== null))
                 ) {
                if (((element.next.attribs.class.indexOf('fsf') > -1) &&
                     (isNaN(element.next.children[0].data[0]))) ||
                    ((element.next.attribs.class.indexOf('fs11') > -1) &&
                     (isNaN(element.next.children[0].data[0])))
                   ) {
                  if (header === '') {
                    header += $$(element).text();
                  } else {
                    header += ` ${$$(element).text()}`;
                  }
                } else {
                  if (header === '') {
                    obj.content.push({
                      title: $$(element).text()
                    });
                  } else {
                    obj.content.push({
                      title: `${header} ${$$(element).text()}`
                    });
                    header = '';
                  }
                }
              } else {
                if (obj.content[obj.content.length - 1] !== undefined) {
                  if (obj.content[obj.content.length - 1].text === undefined) {
                    obj.content[obj.content.length - 1].text = $(element).text();
                  } else {
                    if (element.attribs.class === element.prev.attribs.class) {
                      obj.content[obj.content.length - 1].text += $$(element).text();
                    } else {
                      obj.content[obj.content.length - 1].text += `\n${$$(element).text()}`;
                    }
                  }
                } else {
                  header = '';
                }
              }
            }
          });
        });

        cornet.on('dom', () => {
          fs.writeFile(`${file}.json`, util.inspect(obj), (err) => {
            if (err) {
              console.err(err);
              callback();
            } else {
              // fs.unlinkSync(`${file}.pdf`);
              // fs.unlinkSync(`${file}.html`);
              console.log(`It\'s saved! ${file}.json`);
              callback();
            }
          });
        });
      }).catch(err => {
        console.error(`Conversion error: ${err}`);
        callback();
      });

      converter.progress(ret => {
        console.log(`${(ret.current * 100.0) / ret.total} %`);
      });
    }));
  }).catch(err => {
    console.error(err);
    callback();
  });
}, err => {
  if (err) {
    console.log('A link failed to process');
  } else {
    console.log('All links have been processed successfully');
  }
});
