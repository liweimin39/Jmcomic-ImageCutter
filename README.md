ImageCutter.js

Overview

ImageCutter.js is a JavaScript library for decrypting and reassembling scrambled images. It processes images that have been divided into horizontal slices and rearranged, restoring them to their original form.

Installation

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
<script src="ImageCutter.min.js"></script>
```

API Reference

JmDecrypt.decryptImageUrl(url, jmId, path, options)

Loads and decrypts an image from a URL.

Parameter Type Description
url string Image URL to load and decrypt
jmId string|number JM ID for layer calculation
path string Image path (used for MD5 calculation)
options object Optional settings (see below)

Options:

· format: Output image format (default: 'image/webp')
· quality: Image quality 0-1 (default: 0.92)
· crossOrigin: CORS setting (default: 'anonymous')

Returns: Promise<HTMLImageElement>

JmDecrypt.decryptImage(image, jmId, path, options)

Decrypts an already-loaded image element.

Parameter Type Description
image HTMLImageElement The loaded image to decrypt
jmId string|number JM ID for layer calculation
path string Image path (used for MD5 calculation)
options object Optional settings (format, quality)

Returns: Promise<HTMLImageElement>

JmDecrypt.load(url, crossOrigin)

Loads an image from a URL.

Parameter Type Description
url string Image URL to load
crossOrigin string CORS setting (default: 'anonymous')

Returns: Promise<HTMLImageElement>

JmDecrypt.calc(jmId, imgIndex, path)

Calculates layer configuration for an image.

Parameter Type Description
jmId string|number JM ID
imgIndex number Image index number
path string Image path

Returns: Object containing layers, md5, and other configuration data

JmDecrypt.reassemble(image, sliceCount)

Reassembles a scrambled image by rearranging its slices.

Parameter Type Description
image HTMLImageElement Source image
sliceCount number Number of slices (2-100)

Returns: HTMLCanvasElement

JmDecrypt.need(jmId)

Checks if an image requires decryption.

Parameter Type Description
jmId string|number JM ID to check

Returns: boolean

JmDecrypt.valid(image)

Validates if an object is a properly loaded image element.

Parameter Type Description
image * Object to validate

Returns: boolean

Usage Example

```javascript
JmDecrypt.decryptImageUrl(
    'https://example.com/image.webp',
    '1169826',
    '00001'
).then(function(img) {
    document.body.appendChild(img);
}).catch(function(err) {
    console.error('Decryption failed:', err.message);
});
```

Algorithm

The library works by:

1. Determining layer count based on JM ID and MD5 hash
2. Dividing the image into horizontal slices of calculated sizes
3. Rearranging slices in a specific order based on the MD5 hash
4. Exporting the reassembled image as a new image element

Browser Support

Requires:

· Canvas API
· ES6 Promise support
· HTMLImageElement

License

MIT