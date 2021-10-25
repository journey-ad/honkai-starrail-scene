import request from '@/utils/xhr.js'

function fetchFromURL(url, responseType, loadCb, success, pushError, error) {
  request({
    method: "get",
    baseURL: window.location.origin,
    url,
    responseType,
    onDownloadProgress: function (evt, length, prog) {
      length && loadCb(true, prog)
    }
  })
    .then(function (resp) {
      resp.lengthComputable || loadCb(resp.lengthComputable)
      success(resp.data)
    })
    .catch(function (e) {
      console.log("load file failed：", e)
      error(url, e)
      pushError({
        url,
        reason: e
      })
      loadCb()
    })
}

function crossOrigin(url, e, done, success, error, o) {
  var div = document.createElement("div");
  div.style.visibility = "hidden";

  var iframe = document.createElement("iframe");
  iframe.src = url
  iframe.width = 0
  iframe.height = 0
  iframe.onload = function () {
    done()
    success()
    document.body.removeChild(div)
  }

  iframe.error = function (e) {
    done()
    o(url, e)
    error({
      url: url,
      reason: e
    })
    document.body.removeChild(div)
  }

  document.body.appendChild(div),
    div.appendChild(iframe)
}

const typeMethods = {
  IMAGE: {
    method: function (t) {
      for (var e = arguments.length, n = Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++)
        n[r - 1] = arguments[r];
      t.crossDomain ? crossOrigin.apply(undefined, n) : fetchFromURL.apply(undefined, n)
    }
  },
  VIDEO: {
    method: function (t) {
      for (var e = arguments.length, n = Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++)
        n[r - 1] = arguments[r];
      t.crossDomain ? crossOrigin.apply(undefined, n) : fetchFromURL.apply(undefined, n)
    }
  },
  SOUND: {
    method: function (t) {
      for (var e = arguments.length, n = Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++)
        n[r - 1] = arguments[r];
      t.crossDomain ? crossOrigin.apply(undefined, n) : fetchFromURL.apply(undefined, n)
    }
  },
  CSS: {
    method: function (t) {
      for (var e = arguments.length, n = Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++)
        n[r - 1] = arguments[r];
      t.crossDomain ? crossOrigin.apply(undefined, n) : fetchFromURL.apply(undefined, n)
    }
  },
  JS: {
    method: function (t) {
      for (var e = arguments.length, n = Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++)
        n[r - 1] = arguments[r];
      t.crossDomain ? crossOrigin.apply(undefined, n) : fetchFromURL.apply(undefined, n)
    }
  },
  JSON: {
    method: function (t) {
      for (var e = arguments.length, n = Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++)
        n[r - 1] = arguments[r];
      t.crossDomain ? crossOrigin.apply(undefined, n) : fetchFromURL.apply(undefined, n)
    }
  },
  TXT: {
    method: function (t) {
      for (var e = arguments.length, n = Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++)
        n[r - 1] = arguments[r];
      t.crossDomain ? crossOrigin.apply(undefined, n) : fetchFromURL.apply(undefined, n)
    }
  },
  XML: {
    method: function (t) {
      for (var e = arguments.length, n = Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++)
        n[r - 1] = arguments[r];
      t.crossDomain ? crossOrigin.apply(undefined, n) : fetchFromURL.apply(undefined, n)
    }
  }
}

const type = url => {
  switch (url.substring(url.lastIndexOf(".") + 1).toLowerCase()) {
    case "jpeg":
    case "jpg":
    case "gif":
    case "png":
    case "webp":
    case "bmp":
      return typeMethods.IMAGE;
    case "ogg":
    case "mp3":
    case "wav":
    case "aac":
      return typeMethods.SOUND;
    case "mp4":
    case "webm":
    case "ts":
      return typeMethods.VIDEO;
    case "json":
      return typeMethods.JSON;
    case "xml":
      return typeMethods.XML;
    case "css":
      return typeMethods.CSS;
    case "js":
      return typeMethods.JS;
    default:
      return typeMethods.TXT
  }
}

class Loader {
  constructor(options) {
    const {
      list = [],
      minTime = 0,
      maxTime,
      defineTime,
      json = {},
      onprogress = function () { },
      onload = function () { },
      onerror = function () { },
    } = options || {}

    this.list = list
    this.minTime = minTime
    this.onprogress = onprogress
    this.onload = onload
    this.count = 0
    this.progress = 0
    this.canLoad = false
    this.max = this.list.length
    this.hasLoad = false
    this.defineTime = defineTime
    this.maxTime = maxTime
    this.onerror = onerror
    this.globalErrList = []
    this.timeslice = Number(Math.ceil(100 / this.list.length).toFixed(0))
    this.loadCb = this.loadCb.bind(this)
    this.init = this.init.bind(this)
    this.final = this.final.bind(this)
  }

  init() {
    this.onprogress(0)
    if (this.defineTime) {
      const check = () => {
        if (this.progress < 100) {
          setTimeout(() => {
            if (!this.hasLoad) {
              this.onprogress(this.progress, Math.round(this.defineTime / 100) * this.progress)
              this.progress += 1
              check()
            }
          }, this.defineTime / 100)
        } else if (this.progress === 100) {
          this.onprogress(this.progress, this.defineTime)
          this.onload()

          if (this.globalErrList.length > 0) this.onerror(this.globalErrList)
        }
      }
      check()
    } else {
      setTimeout(() => {
        this.canLoad = true
        this.final()
      }, this.minTime)

      this.list.forEach((item, i) => {
        type(item.url)
          .method(
            { crossDomain: item.crossDomain || false },
            item.url,
            item.responseType,
            this.loadCb,
            data => {
              item.load && item.load(data, i)
            },
            err => {
              this.globalErrList.push(err)
            },
            (url, err) => {
              item.error && item.error(url, i, err)
            }
          )
      })
    }
  }

  loadCb(flag, prog) {
    if (!this.hasLoad) {
      this.progress += flag ? prog * this.timeslice : this.timeslice
      this.progress = this.progress > 100 ? 100 : this.progress

      if (this.progress <= 99) {
        this.onprogress(Number(this.progress.toFixed(0)))
      }
    }

    this.final()
  }

  final() {
    if (this.progress > 99 && this.canLoad && !this.hasLoad) {
      this.progress = 100

      this.onprogress && this.onprogress(this.progress)

      this.onload && this.onload()

      this.globalErrList.length > 0 && this.onerror(this.globalErrList)

      this.hasLoad = true
    }
  }
}

export { Loader }