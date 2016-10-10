{
  'use strict'
  const sourceLoadComplete = Symbol('sourceLoadComplete')
  const setSource = Symbol('setSource')
  const generate = Symbol('generate')
  const getEdgePoint = Symbol('getEdgePoint')
  const grayscaleFilterR = Symbol('grayscaleFilterR')
  const convolutionFilterR = Symbol('convolutionFilterR')

  let image,
      source,
      canvas,
      context,
      generating = true,
      timeoutId = null

  let generateTime = 0

  // fork from https://github.com/timbennett/delaunay
  let Delaunay = (() => {
    /**
     * Node
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} id
     */
    function Node(x, y, id) {
      this.x = x
      this.y = y
      this.id = !isNaN(id) && isFinite(id) ? id : null
    }

    Node.prototype = {
      eq: function(p) {
        let dx = this.x - p.x
        let dy = this.y - p.y
        return (dx < 0 ? -dx : dx) < 0.0001 && (dy < 0 ? -dy : dy) < 0.0001
      },

      toString: function() {
        return '(x: ' + this.x + ', y: ' + this.y + ')'
      }
    }

    /**
     * Edge
     *
     * @param {Node} p0
     * @param {Node} p1
     */
    function Edge(p0, p1) {
      this.nodes = [p0, p1]
    }

    Edge.prototype = {
      eq: function(edge) {
        let na = this.nodes,
            nb = edge.nodes
        let na0 = na[0], na1 = na[1],
            nb0 = nb[0], nb1 = nb[1]
        return (na0.eq(nb0) && na1.eq(nb1)) || (na0.eq(nb1) && na1.eq(nb0))
      }
    }

    /**
     * Triangle
     *
     * @param {Node} p0
     * @param {Node} p1
     * @param {Node} p2
     */
    function Triangle(p0, p1, p2) {
      this.nodes = [p0, p1, p2]
      this.edges = [new Edge(p0, p1), new Edge(p1, p2), new Edge(p2, p0)]

      // 今回は id は使用しない
      this.id = null

      // この三角形の外接円を作成する

      let circle = this.circle = new Object()

      let ax = p1.x - p0.x, ay = p1.y - p0.y,
          bx = p2.x - p0.x, by = p2.y - p0.y,
          t = (p1.x * p1.x - p0.x * p0.x + p1.y * p1.y - p0.y * p0.y),
          u = (p2.x * p2.x - p0.x * p0.x + p2.y * p2.y - p0.y * p0.y)

      let s = 1 / (2 * (ax * by - ay * bx))

      circle.x = ((p2.y - p0.y) * t + (p0.y - p1.y) * u) * s
      circle.y = ((p0.x - p2.x) * t + (p1.x - p0.x) * u) * s

      let dx = p0.x - circle.x
      let dy = p0.y - circle.y
      circle.radiusSq = dx * dx + dy * dy
    }


    /**
     * Delaunay
     *
     * @param {Number} width
     * @param {Number} height
     */
    function Delaunay(width, height) {
      this.width = width
      this.height = height

      this._triangles = null

      this.clear()
    }

    Delaunay.prototype = {
      clear: function() {
        let p0 = new Node(0, 0)
        let p1 = new Node(this.width, 0)
        let p2 = new Node(this.width, this.height)
        let p3 = new Node(0, this.height)

        this._triangles = [
          new Triangle(p0, p1, p2),
          new Triangle(p0, p2, p3)
        ]

        return this
      },

      insert: function(points) {
        let k, klen, i, ilen, j, jlen
        let triangles, t, temps, edges, edge, polygon
        let x, y, circle, dx, dy, distSq

        for (k = 0, klen = points.length; k < klen; k++) {
          x = points[k][0]
          y = points[k][1]

          triangles = this._triangles
          temps = []
          edges = []

          for (ilen = triangles.length, i = 0; i < ilen; i++) {
            t = triangles[i]

            // 座標が三角形の外接円に含まれるか調べる
            circle  = t.circle
            dx = circle.x - x
            dy = circle.y - y
            distSq = dx * dx + dy * dy

            if (distSq < circle.radiusSq) {
                // 含まれる場合三角形の辺を保存
              edges.push(t.edges[0], t.edges[1], t.edges[2])
            } else {
                // 含まれない場合は持ち越し
              temps.push(t)
            }
          }

          polygon = []

          // 辺の重複をチェック, 重複する場合は削除する
          edgesLoop: for (ilen = edges.length, i = 0; i < ilen; i++) {
            edge = edges[i]

            // 辺を比較して重複していれば削除
            for (jlen = polygon.length, j = 0; j < jlen; j++) {
              if (edge.eq(polygon[j])) {
                polygon.splice(j, 1)
                continue edgesLoop
              }
            }

            polygon.push(edge)
          }

          for (ilen = polygon.length, i = 0; i < ilen; i++) {
              edge = polygon[i]
              temps.push(new Triangle(edge.nodes[0], edge.nodes[1], new Node(x, y)))
          }

          this._triangles = temps
        }

        return this
      },

      getTriangles: function() {
        return this._triangles.slice()
      }
    }

    Delaunay.Node = Node

    return Delaunay
  })()

  class LowPoly {
    constructor (src, { EDGE_DETECT_VALUE, POINT_RATE, POINT_MAX_NUM, BLUR_SIZE, EDGE_SIZE, PIXEL_LIMIT }) {
      this.src = src
      this.EDGE_DETECT_VALUE = EDGE_DETECT_VALUE || 80
      this.POINT_RATE = POINT_RATE || 0.075
      this.POINT_MAX_NUM = POINT_MAX_NUM || 3500
      this.BLUR_SIZE = BLUR_SIZE || 2
      this.EDGE_SIZE = EDGE_SIZE || 6
      this.PIXEL_LIMIT = PIXEL_LIMIT || 350000

      this.blur = ((size) => {
        let matrix = []
        let side = size * 2 + 1
        let i, len = side * side
        for (i = 0; i < len; i++) matrix[i] = 1
        return matrix
      })(this.BLUR_SIZE)

      this.edge = ((size) => {
        let matrix = []
        let side = size * 2 + 1
        let i, len = side * side
        let center = len * 0.5 | 0
        for (i = 0; i < len; i++) matrix[i] = i === center ? -len + 1 : 1
        return matrix
      })(this.EDGE_SIZE)
    }

    init () {
      let self = this
      canvas = document.createElement('canvas')
      context = canvas.getContext('2d')

      source = new Image()
      this[setSource](this.src)
      return new Promise((res, rej) => {
        source.addEventListener('load', () => {
          self[sourceLoadComplete]().then((data) => {
            res(data)
          })
        }, false)
      })
    }

    [sourceLoadComplete] (e) {
      let self = this
      let width  = source.width
      let height = source.height
      let pixelNum = width * height
      if (pixelNum > this.PIXEL_LIMIT) {
        let scale = Math.sqrt(this.PIXEL_LIMIT / pixelNum)
        source.width  = width * scale | 0
        source.height = height * scale | 0

        console.log('Source resizing ' + width + 'px x ' + height + 'px' + ' -> ' + source.width + 'px x ' + source.height + 'px')
      }

      if (timeoutId) clearTimeout(timeoutId)
      generateTime = new Date().getTime()
      console.log('Generate start...')
      return new Promise((res, rej) => {
        timeoutId = setTimeout(() => {
          self[generate]().then((data) => {
            res(data)
          })
        }, 0)
      })
    }

    [setSource] (src) {
      generating = true
      if (source.src !== src) {
        source.removeAttribute('width')
        source.removeAttribute('height')
        source.src = src
      } else {
        this[sourceLoadComplete](null)
      }
    }

    [generate] () {
      let width  = canvas.width = source.width
      let height = canvas.height = source.height

      context.drawImage(source, 0, 0, width, height)

      let imageData = context.getImageData(0, 0, width, height)
      let colorData = context.getImageData(0, 0, width, height).data

      this[grayscaleFilterR](imageData)
      this[convolutionFilterR](this.blur, imageData, this.blur.length)
      this[convolutionFilterR](this.edge, imageData)

      let temp = this[getEdgePoint](imageData)
      let detectionNum = temp.length

      let points = []
      let i = 0, ilen = temp.length
      let tlen = ilen
      let j, limit = Math.round(ilen * this.POINT_RATE)
      if (limit > this.POINT_MAX_NUM) {
        limit = this.POINT_MAX_NUM
      }

      while (i < limit && i < ilen) {
        j = tlen * Math.random() | 0
        points.push(temp[j])
        temp.splice(j, 1)
        tlen--
        i++
      }
      
      let delaunay = new Delaunay(width, height)
      let triangles = delaunay.insert(points).getTriangles()

      let t, p0, p1, p2, cx, cy

      for (ilen = triangles.length, i = 0; i < ilen; i++) {
        t = triangles[i]
        p0 = t.nodes[0]; p1 = t.nodes[1]; p2 = t.nodes[2]

        context.beginPath()
        context.moveTo(p0.x, p0.y)
        context.lineTo(p1.x, p1.y)
        context.lineTo(p2.x, p2.y)
        context.lineTo(p0.x, p0.y)

        cx = (p0.x + p1.x + p2.x) * 0.33333
        cy = (p0.y + p1.y + p2.y) * 0.33333

        j = ((cx | 0) + (cy | 0) * width) << 2

        context.fillStyle = 'rgb(' + colorData[j] + ', ' + colorData[j + 1] + ', ' + colorData[j + 2] + ')'
        context.fill()
      }
      
      let dataUrl = canvas.toDataURL('image/png')

      generateTime = new Date().getTime() - generateTime
      console.log(
        'Generate completed ' + generateTime + 'ms, ' +
        points.length + ' points (out of ' + detectionNum + ' points, ' + (points.length / detectionNum * 100).toFixed(2) + ' %), ' +
        triangles.length + ' triangles'
      )

      generating = false

      return new Promise((res, rej) => {
        res(dataUrl)
      })
    }

    [getEdgePoint] (imageData) {
      let width  = imageData.width
      let height = imageData.height
      let data = imageData.data

      let E = this.EDGE_DETECT_VALUE

      let points = []
      let x, y, row, col, sx, sy, step, sum, total

      for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
          sum = total = 0

          for (row = -1; row <= 1; row++) {
            sy = y + row
            step = sy * width
            if (sy >= 0 && sy < height) {
              for (col = -1; col <= 1; col++) {
                sx = x + col

                if (sx >= 0 && sx < width) {
                  sum += data[(sx + step) << 2]
                  total++
                }
              }
            }
          }

          if (total) sum /= total
          if (sum > E) points.push(new Array(x, y))
        }
      }

      return points
    }

    [grayscaleFilterR] (imageData) {
      let width  = imageData.width | 0
      let height = imageData.height | 0
      let data = imageData.data

      let x, y
      let i, step
      let r, g, b

      for (y = 0; y < height; y++) {
        step = y * width

        for (x = 0; x < width; x++) {
          i = (x + step) << 2
          r = data[i]
          g = data[i + 1]
          b = data[i + 2]

          data[i] = (Math.max(r, g, b) + Math.min(r, g, b)) >> 2
        }
      }

      return imageData
    }

    [convolutionFilterR] (matrix, imageData, divisor) {
      matrix  = matrix.slice()
      divisor = divisor || 1

      let divscalar = divisor ? 1 / divisor : 0
      let k, len
      if (divscalar !== 1) {
          for (k = 0, len = matrix.length; k < matrix.length; k++) {
              matrix[k] *= divscalar
          }
      }

      let data = imageData.data

      len = data.length >> 2
      let copy = new Uint8Array(len)
      for (let i = 0; i < len; i++) copy[i] = data[i << 2]

      let width  = imageData.width | 0
      let height = imageData.height | 0
      let size  = Math.sqrt(matrix.length)
      let range = size * 0.5 | 0

      let x, y
      let r, g, b, v
      let col, row, sx, sy
      let i, istep, jstep, kstep

      for (y = 0; y < height; y++) {
        istep = y * width

        for (x = 0; x < width; x++) {
          r = g = b = 0

          for (row = -range; row <= range; row++) {
            sy = y + row
            jstep = sy * width
            kstep = (row + range) * size

            if (sy >= 0 && sy < height) {
              for (col = -range; col <= range; col++) {
                sx = x + col

                if (
                  sx >= 0 && sx < width &&
                  (v = matrix[(col + range) + kstep])
                ) {
                  r += copy[sx + jstep] * v
                }
              }
            }
          }

          if (r < 0) r = 0; else if (r > 255) r = 255

          data[(x + istep) << 2] = r & 0xFF
        }
      }
        return imageData
    }

  }

  if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS
    module.exports = exports = LowPoly

  } else if (typeof define === 'function' && define.amd) {
    // AMD support
    define(() => LowPoly)

  } else if (typeof window === 'object') {
    // Normal way
    window.LowPoly = LowPoly
  }

}