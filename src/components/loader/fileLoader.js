import { EventDispatcher } from "three";
import Loader from './loader';


class LoadItem {
  constructor(item) {
    const { src = "", type = "", id = Math.random() } = item

    this.id = id
    this.url = src
    this.mediaType = this.isBase64 ? 'base64' : type

    switch (type) {
      case "video":
      case "image":
        this.responseType = "blob";
        break;

      case "audio":
        this.responseType = "arraybuffer";
        break;

      default:
        this.responseType = type
    }

    this.result = null
    this.loader = fileLoader.loader

    if (this.mediaType === 'base64') {
      this.load(this.url)
    }
  }

  checkComplete() {
    this.loader.onFileComplete(this)
    this.loader.counter += 1
    this.loader.counter === Object.keys(this.loader.list).length && this.loader.onLoadComplete()
  }

  load(data) {
    switch (this.mediaType) {
      case "base64":
        this.result = new Image
        this.result.onload = this.checkComplete.bind(this)
        this.result.src = data
        break;

      case "video":
        this.result = window.URL.createObjectURL(data)
        this.checkComplete()
        break;

      case "image":
      case "blob":
        this.result = new Image
        this.result.onload = this.checkComplete.bind(this)
        this.result.src = window.URL.createObjectURL(data)
        break;

      case "json":
      default:
        this.result = data
        this.checkComplete()
    }
  }

  get isBase64() {
    return this.url.startsWith("data:image")
  }
}

class LoadQueue extends EventDispatcher {
  constructor() {
    super()
    this.loaded = true
    this.list = {}
    this.counter = 0
  }

  removeAll() {
    this.counter = 0
    this.list = {}
  }

  getItems() {
    return Object.values(this.list)
  }

  getResult(id) {
    return this.list[id] ? this.list[id].result : null
  }

  onLoadProgress(e) {
    this.dispatchEvent({
      type: "progress",
      progress: e
    })
  }

  onLoadComplete() {
    this.loaded = true
    this.dispatchEvent({
      type: "complete"
    })
  }

  onLoadError(e) {
    this.dispatchEvent({
      type: "error",
      data: e
    })
  }

  onFileComplete(e) {
    this.dispatchEvent({
      type: "fileComplete",
      data: e
    })
  }

  loadManifest(manifest) {
    if (manifest.length > 0) {
      const list = [];

      manifest.forEach((item) => {
        if (!item.src) throw new Error("图片不存在，请仔细核对" + item.id);

        if (this.list[item.id]) {
          console.warn("duplicate item:", item.id);
        } else {
          const loader = new LoadItem(item, this)
          this.list[item.id] = loader

          if (!loader.isBase64) {
            list.push(loader)
          }

          this.loaded = false
        }
      })

      if (list.length > 0) {
        const loader = new Loader({
          minTime: 10,
          onprogress: this.onLoadProgress.bind(this),
          onerror: this.onLoadError.bind(this),
          list
        })
        loader.init()

      } else {
        if (this.loaded) this.onLoadComplete()
      }
    } else {
      if (this.loaded) this.onLoadComplete()
    }
  }
}

const fileLoader = {
  LoadItem,
  LoadQueue,
  loader: new LoadQueue(),
  createLoader() {
    return new LoadQueue
  }
}

export default fileLoader