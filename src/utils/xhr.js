const request = option => {
  const {
    method = 'get',
    url = '',
    responseType = 'text',
    data = {},
    baseURL,
    timeout,
    onDownloadProgress = function () { }
  } = option

  const xhr = (function () {
    let xhr = false
    try {
      xhr = new XMLHttpRequest()
    } catch (e) {
      try {
        xhr = new ActiveXObject("Microsoft.XMLHTTP")
      } catch (e) {
        try {
          xhr = new ActiveXobject("Microsoft.XMLHTTP")
        } catch (e) {
          xhr = false
        }
      }
    }
    return xhr
  })();

  function parse(xhr, opt) {
    var resp = xhr.response ? xhr.response : xhr.responseText;

    if (typeof resp === "string" && opt.responseType === "json") {
      resp = JSON.parse(resp)
    }

    return resp
  }

  return new Promise((resolve, reject) => {
    if (!xhr) reject(new Error("您的浏览器不支持XHR"))

    var length = false, loaded = 0;
    xhr.onprogress = function (evt) {
      length = evt.lengthComputable
      onDownloadProgress(evt, length, (evt.loaded - loaded) / evt.total)
      loaded = evt.loaded
    }

    xhr.open(method, url)
    xhr.responseType = responseType
    xhr.onreadystatechange = function (n) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(
            {
              lengthComputable: length,
              data: parse(xhr, { responseType })
            }
          )
        } else {
          reject(xhr.statusText)
        }
      }
    }

    xhr.send(data)
  })
}

export default request