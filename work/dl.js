const path = require('path');
const download = require('image-downloader')

const list = require('./file')

const __BASE = 'https://webstatic.mihoyo.com/rpg/event/e20211008reserve'

// console.log(list.LOADING_MANIFEST)

list.INDEX_MANIFEST.forEach(file => {
  const fileName = path.join(__dirname, 'out', `${file.id}.png`)
  if (file.src.startsWith('data:image/png;')) {
    const base64Data = file.src.replace(/^data:image\/png;base64,/, "")
    require("fs").writeFile(fileName, base64Data, 'base64', function (err) {
      console.log(err);
    });

  } else {
    download.image({
      url: `${__BASE}/${file.src}`,
      dest: fileName
    })
      .then(({ filename }) => {
        console.log('Saved to', filename)  // saved to /path/to/dest/image.jpg
      })
      .catch((err) => console.error(err))
  }
})
