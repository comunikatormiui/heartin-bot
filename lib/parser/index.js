import fs         from 'fs';
import request    from 'request-promise';
import download   from 'request';
import cheerio    from 'cheerio';
import jsdom      from 'jsdom';
import eachSeries from 'async/eachSeries';
import htmlparser from 'htmlparser2';
import pdftohtml  from 'pdftohtmljs';
import Cornet     from 'cornet';
import path       from 'path';
import crypto     from 'crypto';
import util       from 'util';
import webshot    from 'webshot';
import _          from 'lodash';
import links      from '../../config/links.js';
import config     from '../../config/parse.js';
import getImages  from './image.js';

eachSeries(links, (link, callback) => {
  let lnk = '';
  if (typeof link === 'object') {
    console.log(`Processing link ${link.link}`);
    lnk = link.link;
  } else {
    console.log(`Processing link ${link}`);
    lnk = link;
  }
  request(lnk)
    .then(html => {
      let title = '';
      let url = '';
      if (typeof link === 'object') {
        title = link.title;
        url = link.link;
      } else {
        let $ = cheerio.load(html);

        title = $('meta[name="citation_title"]').attr('content');
        url = $('meta[name="citation_pdf_url"]').attr('content');

        $ = null;
      }

      console.log(title);
      console.log(url);

      const file = crypto.createHash('md5').update(url).digest('hex');

      download(url).pipe(fs.createWriteStream(`./${config.dir}/pdf/${file}.pdf`).on('finish', () => {

        const cornet = new Cornet();
        const converter = new pdftohtml(`${path.join(__dirname, `../../${config.dir}/pdf/`)}${file}.pdf`, `./${config.dir}/html/${file}.html`);
        const classes = [];

        converter.convert('ipad').then(() => {
          console.log(`Success convert`);

          eachSeries(config.options, (style, cb) => {
            jsdom.env(`./${config.dir}/html/${file}.html`, (err, window) => {
              if (err) {
                console.error(err);
                cb(err);
              } else {
                for (let i = 0; i < window.document.styleSheets[2].cssRules.length; i++) {
                  if (window.document.styleSheets[2].cssRules[i].style !== undefined) {
                    if (window.document.styleSheets[2].cssRules[i].style[style.name] === style.value) {
                      if (window.document.styleSheets[2].cssRules[i].selectorText !== undefined) {
                        classes.push(window.document.styleSheets[2].cssRules[i].selectorText.slice(1));
                      }
                    }
                  }
                }
                window.close();
                cb();
              }
            });
          }, err => {
            if (err) {
              console.error('A style failed to process');
              console.error(err);
            } else {
              const Parser = htmlparser.WritableStream;
              fs.createReadStream(`./${config.dir}/html/${file}.html`).pipe(new Parser(cornet));

              let $$ = cheerio;
              let header = 0;
              let wrap = 0;
              let text = '';
              let txt = '';
              const pages = [];
              const obj = {
                title,
                url,
                content: []
              };

              cornet.select('#page-container > div', elem => {
                $$(elem).find('.pc > *').each((i, element) => {
                  if (element.name === 'div') {
                    if ((element.attribs.class.indexOf(classes[0]) > -1) ||
                        (element.attribs.class.indexOf(classes[1]) > -1) ||
                        ((element.attribs.class.indexOf(classes[2]) > -1) &&
                         (element.children[0].data.match(/(\d{1}|\d{1}[a-z]{1})(\.\d{1}){2,3}/ig) !== null)) ||
                        ((element.attribs.class.indexOf(classes[5]) > -1) &&
                         (element.children[0].data.match(/(\d{1}|\d{1}[a-z]{1})(\.\d{1}){2,3}/ig) !== null))
                       ) {
                      if (similar(element.attribs.class, element.prev.attribs.class) > 95) {
                        if (obj.content[obj.content.length - 1] !== undefined) {
                          obj.content[obj.content.length - 1].title += ` ${$$(element).text()}`;
                          header = 1;
                        }
                      } else {
                        if (((element.attribs.class.indexOf(classes[0]) > -1) &&
                             (isNaN($$(element).text()[0]))) ||
                            ((element.attribs.class.indexOf(classes[1]) > -1) &&
                             (isNaN($$(element).text()[0])))
                           ) {
                          if (obj.content[obj.content.length - 1] !== undefined) {
                            obj.content[obj.content.length - 1].title += ` ${$$(element).text()}`;
                            header = 1;
                          } else {
                            obj.content.push({
                              title: $$(element).text()
                            });
                            header = 1;
                          }
                        } else {
                          const result = $$(element).text().match(/(\d{1}|\d{1}[a-z]{1})(\.\d{1}){1,4}/ig);
                          obj.content.push({
                            title: $$(element).text()
                          });
                          if (result !== null) {
                            const num = result[0].split('.');
                            obj.content[obj.content.length - 1].parent = num.slice(0, num.length-1).join('.');
                          }
                          header = 1;
                        }
                      }
                    } else {
                      if (obj.content[obj.content.length - 1] !== undefined) {
                        if (header === 1) {
                          if (similar(element.attribs.class, element.prev.attribs.class) > 95) {
                            obj.content[obj.content.length - 1].title += ` ${$$(element).text()}`;
                            header = 1;
                          } else {
                            if (element.attribs.class.indexOf(classes[3]) === -1) {
                              if (obj.content[obj.content.length - 1].text === undefined) {
                                obj.content[obj.content.length - 1].text = $$(element).text();
                                header = 0;
                              } else {
                                text = $$(element).text();
                                if (text[text.length - 1] === '-') {
                                  txt = text.slice(0, -1);
                                } else {
                                  txt = text;
                                }
                                if (similar(element.attribs.class, element.prev.attribs.class) > 90) {
                                  if (wrap === 1) {
                                    obj.content[obj.content.length - 1].text += `${txt}`;
                                  } else {
                                    obj.content[obj.content.length - 1].text += ` ${txt}`;
                                  }
                                  header = 0;
                                } else {
                                  obj.content[obj.content.length - 1].text += `\n${txt}`;
                                  header = 0;
                                }
                                if (text[text.length - 1] === '-') {
                                  wrap = 1;
                                } else {
                                  wrap = 0;
                                }
                              }
                            }
                          }
                        } else {
                          if (element.attribs.class.indexOf(classes[3]) === -1) {
                            if (obj.content[obj.content.length - 1].text === undefined) {
                              obj.content[obj.content.length - 1].text = $$(element).text();
                            } else {
                              text = $$(element).text();
                              if (text[text.length - 1] === '-') {
                                txt = text.slice(0, -1);
                              } else {
                                txt = text;
                              }
                              if (similar(element.attribs.class, element.prev.attribs.class) > 90) {
                                if (wrap === 1) {
                                  obj.content[obj.content.length - 1].text += `${txt}`;
                                } else {
                                  obj.content[obj.content.length - 1].text += ` ${txt}`;
                                }
                              } else {
                                obj.content[obj.content.length - 1].text += `\n${txt}`;
                              }
                              if (text[text.length - 1] === '-') {
                                wrap = 1;
                              } else {
                                wrap = 0;
                              }
                            }
                          }
                        }
                      } else {
                        header = 0;
                      }
                    }
                  }
                });
                pages.push(elem.attribs['data-page-no']);
              });

              cornet.on('dom', () => {
                fs.writeFile(`${file}.json`, util.inspect(obj, {
                  depth: null,
                  maxArrayLength: null
                }), (err) => {
                  if (err) {
                    console.err(err);
                    callback(err);
                  } else {
                    $$ = null;
                    fs.unlinkSync(`${file}.pdf`);
                    fs.unlinkSync(`${file}.html`);
                    console.log(`It\'s saved! ${file}.json`);
                    callback();
                  }
                });
              });
            }
          });
        }).catch(err => {
          console.error(`Conversion error: ${err}`);
          callback(err);
        });

        converter.progress(ret => {
          console.log(`${Math.round((ret.current * 100.0) / ret.total)} %`);
        });
      }));
    }).catch(err => {
      console.error(err);
      callback(err);
    });
}, err => {
  if (err) {
    console.error('A link failed to process');
    console.error(err);
  } else {
    console.log('All links have been processed successfully');
  }
});

function similar(a, b) {
  let equivalency = 0;
  const minLength = (a.length > b.length) ? b.length : a.length;
  const maxLength = (a.length < b.length) ? b.length : a.length;
  for (let i = 0; i < minLength; i++) {
    if (a[i] === b[i]) {
      equivalency++;
    }
  }

  const weight = equivalency / maxLength;
  return (weight * 100);
}
