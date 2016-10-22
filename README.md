## What's it?
`lowpoly.js` is a JS liberary which can style an image with [Low Poly](https://en.wikipedia.org/wiki/Low_poly).

![Img](https://github.com/jrainlau/LowPolifier/raw/master/example/1.jpg)

![Img](https://github.com/jrainlau/LowPolifier/raw/master/example/2.jpg)

## Install
```
npm install lowpoly
```

## Usage
Note that `lowpoly.js` was written in ES6, it would work fine in the lastest version of morden browsers, or use it with `Babel`.

```
import LowPoly from 'lowpoly'

new LowPoly(src, config) .init() .then((data) => { ... })
```
After the `init()` function, it will returns a promise, which includes a base64 source of the low-poly style image.

## Params

| Param | Type | Description |
| --- | --- | --- |
| src | {String} | Address of an original image |
| config | {Object} | The configuration object |

The configuration object might take 6 properties:

> `EDGE_DETECT_VALUE`: Lower this to increase edge contrast sensitivity.

> `POINT_RATE`: Number of points distribution ratio of points (number) on the edge, detail, generated higher see console.

> `POINT_MAX_NUM`: Maximum points sampled. Higher = more detail.

> `BLUR_SIZE`: Smaller is more detailed.

> `EDGE_SIZE`: Larger is more detailed.

> `PIXEL_LIMIT`: Images may have this many pixels at most (width x height) or will be resampled. Have had no trouble setting this to ~10,000,000 or more.

## License
MIT






