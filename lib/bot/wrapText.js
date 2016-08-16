export default (context, text, x, y, maxWidth, lineHeight) => {
  let cars = text.split('\n');

  for (let i = 0; i < cars.length; i++) {

    let line = '';
    let words = cars[i].split(' ');

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;

      if (testWidth > maxWidth) {
        context.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }

    context.fillText(line, x, y);
    y += lineHeight;
  }
}
