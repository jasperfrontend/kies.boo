// src/composables/useAverageColor.js
export async function averageColor (srcOrImgElement) {
  return new Promise((resolve, reject) => {
    let img
    if (typeof srcOrImgElement === 'string') {
      img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = srcOrImgElement
    } else {
      img = srcOrImgElement
    }
    img.addEventListener('load', function () {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      ctx.drawImage(img, 0, 0)
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let r = 0, g = 0, b = 0, count = 0
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          count++
        }
        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)
        resolve([r, g, b])
      } catch {
        // Cross-origin issue or empty canvas
        resolve([128, 128, 128]) // fallback grey
      }
    })
    img.onerror = () => resolve([128, 128, 128]) // fallback grey
    if (typeof srcOrImgElement !== 'string' && img.complete) {
      img.onload() // trigger if already loaded
    }
  })
}
