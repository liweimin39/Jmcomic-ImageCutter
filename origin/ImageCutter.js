// Immediately invoked function expression to avoid polluting global scope
(function (g) {
    'use strict';

    /**
     * MD5 hashing function with fallback mechanisms
     * Tries CryptoJS, global md5 function, or a simple hash implementation
     * @returns {Function} A function that takes a string and returns a 32-character hex hash
     */
    function md5() {
        // Use CryptoJS MD5 if available
        if (typeof CryptoJS !== 'undefined' && CryptoJS.MD5) {
            return function (a) {
                return CryptoJS.MD5(a).toString();
            };
        }
        // Use global md5 function if available
        if (typeof g.md5 === 'function') {
            return g.md5;
        }
        if (typeof window !== 'undefined' && window.md5) {
            return window.md5;
        }
        // Fallback: simple hash implementation (not cryptographically secure)
        return function (a) {
            var b = 0;
            for (var c = 0; c < a.length; c++) {
                var d = a.charCodeAt(c);
                b = ((b << 5) - b) + d;
                b = b & b; // Convert to 32-bit integer
            }
            return Math.abs(b).toString(16).padStart(32, '0');
        };
    }

    var _md5 = md5();

    /**
     * Calculate layer information for image decryption
     * This function determines how many slices/layers an image should be divided into
     * based on the JM ID and other parameters
     * 
     * @param {string|number} a - JM ID (image identifier)
     * @param {number} b - Image index number
     * @param {string} c - Optional image path (used for hash calculation)
     * @returns {Object} Object containing layer configuration details
     */
    function calc(a, b, c) {
        a = parseInt(a, 10);
        var d = parseInt(b, 10);
        var e = String(d).padStart(5, '0');
        var f = b;
        if (!c) {
            c = e + '.webp';
        }
        var k = c.substring(0, 5);
        var l = _md5(String(a) + k);
        var n = l.charCodeAt(l.length - 1);
        var o;

        // Determine number of layers based on JM ID range
        if (a >= 220980 && a < 268850) {
            o = 10; // Fixed 10 layers for this range
        } else if (a >= 268850 && a <= 421925) {
            o = n % 10; // 0-9 layers based on last char of MD5
        } else {
            o = n % 8; // 0-7 layers based on last char of MD5
        }

        // Calculate actual layer count: if result is 0-9, use result*2+2, else 10
        var p = (o >= 0 && o <= 9) ? o * 2 + 2 : 10;

        return {
            layers: p,        // Number of slices to divide image into
            modResult: o,     // Intermediate calculation result
            key: n,           // Last character code from MD5
            pathPrefix: k,    // First 5 characters of path
            path: c,          // Full image path
            md5: l,           // Full MD5 hash
            jmId: a,          // Original JM ID
            imgIndex: f,      // Original image index
            imgNum: d,        // Parsed image number
            imgStr: e         // Padded image number string
        };
    }

    /**
     * Check if an image requires decryption based on its JM ID
     * @param {string|number} a - JM ID to check
     * @returns {boolean} True if decryption is needed
     */
    function need(a) {
        a = parseInt(a, 10);
        return a >= 220980;
    }

    /**
     * Validate if the given object is a valid loaded HTMLImageElement
     * @param {*} a - Object to validate
     * @returns {boolean} True if valid image element with dimensions
     */
    function valid(a) {
        if (!a) return false;
        if (!(a instanceof HTMLImageElement)) return false;
        var b = a.naturalWidth || a.width;
        var c = a.naturalHeight || a.height;
        return b > 0 && c > 0;
    }

    /**
     * Reassemble scrambled image by rearranging horizontal slices
     * The image is divided into slices that are rearranged to restore the original
     * 
     * @param {HTMLImageElement} a - The source image to reassemble
     * @param {number} b - Number of slices to divide into (2-100)
     * @returns {HTMLCanvasElement} Canvas with reassembled image
     * @throws {Error} If image invalid or slice count out of range
     */
    function reassemble(a, b) {
        if (!valid(a)) {
            throw new Error('Invalid image');
        }
        if (typeof b !== 'number' || b < 2 || b > 100) {
            throw new Error('Invalid slice count: ' + b);
        }

        var c = a.naturalWidth || a.width;
        var d = a.naturalHeight || a.height;
        if (c <= 0 || d <= 0) {
            throw new Error('Invalid size');
        }

        var e = document.createElement('canvas');
        var f = e.getContext('2d');
        e.width = c;
        e.height = d;

        // Calculate slice sizes
        var i = Math.min(b, d);           // Number of slices (capped at image height)
        var j = Math.floor(d / i);        // Base height per slice
        var k = d % i;                    // Remainder pixels for last slice

        f.clearRect(0, 0, c, d);

        try {
            // Draw first slice (bottom section) at top
            f.drawImage(a, 0, d - j - k, c, j + k, 0, 0, c, j + k);

            // Draw remaining slices in reversed order (scramble reassembly)
            for (var l = 0; l < i - 1; l++) {
                var m = j * (i - l - 2);        // Source y position (from bottom)
                var n = (l + 1) * j + k;         // Destination y position (from top)
                f.drawImage(a, 0, m, c, j, 0, n, c, j);
            }
        } catch (o) {
            throw new Error('Reassemble failed: ' + o.message);
        }

        return e;
    }

    /**
     * Convert a reassembled image to an HTMLImageElement
     * 
     * @param {HTMLImageElement} a - Source image
     * @param {number} b - Number of slices
     * @param {string} c - MIME type for export (default: 'image/webp')
     * @param {number} d - Image quality (0-1, default: 0.92)
     * @returns {Promise<HTMLImageElement>} Promise resolving to the reassembled image
     */
    function toImage(a, b, c, d) {
        c = c || 'image/webp';
        d = d || 0.92;
        return new Promise(function (e, f) {
            try {
                var i = reassemble(a, b);
                var j;
                try {
                    j = i.toDataURL(c, d);
                } catch (k) {
                    j = i.toDataURL('image/png'); // Fallback to PNG if WebP not supported
                }
                if (!j || j.length < 100) {
                    f(new Error('Export failed'));
                    return;
                }

                var l = new Image();
                var m = setTimeout(function () {
                    f(new Error('Timeout'));
                }, 10000);

                l.onload = function () {
                    clearTimeout(m);
                    var a = this.naturalWidth || this.width;
                    var b = this.naturalHeight || this.height;
                    if (a <= 0 || b <= 0) {
                        f(new Error('Invalid size'));
                        return;
                    }
                    e(this);
                };

                l.onerror = function () {
                    clearTimeout(m);
                    f(new Error('Load failed'));
                };

                l.src = j;
            } catch (n) {
                f(n);
            }
        });
    }

    /**
     * Load an image from URL with cross-origin support
     * 
     * @param {string} a - Image URL
     * @param {string} b - Cross-origin setting (default: 'anonymous')
     * @returns {Promise<HTMLImageElement>} Promise resolving to loaded image
     */
    function load(a, b) {
        b = b || 'anonymous';
        return new Promise(function (c, d) {
            var e = new Image();
            var f = false;
            e.crossOrigin = b;

            var i = setTimeout(function () {
                if (!f) {
                    f = true;
                    e.src = '';
                    d(new Error('Timeout: ' + a));
                }
            }, 30000);

            e.onload = function () {
                if (!f) {
                    clearTimeout(i);
                    f = true;
                    c(this);
                }
            };

            e.onerror = function () {
                if (!f) {
                    clearTimeout(i);
                    f = true;
                    e.src = '';
                    d(new Error('Failed: ' + a));
                }
            };

            e.src = a;
        });
    }

    /**
     * Decrypt a loaded image by reassembling its slices
     * Main entry point for decrypting an already-loaded image element
     * 
     * @param {HTMLImageElement} a - The image element to decrypt
     * @param {string|number} b - JM ID for the image
     * @param {string} c - Optional image path
     * @param {Object} d - Optional options (format, quality, crossOrigin)
     * @returns {Promise<HTMLImageElement>} Promise resolving to decrypted image
     */
    function decrypt(a, b, c, d) {
        d = d || {};
        if (!need(b)) {
            return Promise.resolve(a);
        }
        if (!a || !(a instanceof HTMLImageElement)) {
            return Promise.reject(new Error('Invalid element'));
        }

        var e = a.naturalWidth || a.width;
        var f = a.naturalHeight || a.height;
        if (e <= 0 || f <= 0) {
            return Promise.reject(new Error('Not loaded'));
        }

        try {
            var i = calc(b, c, d.path);
            var j = Math.min(Math.max(i.layers, 2), 50); // Clamp layers between 2 and 50
            return toImage(a, j, d.format || 'image/webp', d.quality || 0.92);
        } catch (k) {
            return Promise.reject(k);
        }
    }

    /**
     * Decrypt an image from a URL
     * Loads the image from URL, then decrypts it
     * 
     * @param {string} a - Image URL
     * @param {string|number} b - JM ID for the image
     * @param {string} c - Optional image path
     * @param {Object} d - Optional options (format, quality, crossOrigin)
     * @returns {Promise<HTMLImageElement>} Promise resolving to decrypted image
     */
    function decryptUrl(a, b, c, d) {
        d = d || {};
        return load(a, d.crossOrigin).then(function (e) {
            return decrypt(e, b, c, d);
        });
    }

    /**
     * Public API export
     * Exposes all major functions for external use
     */
    var J = {
        calc: calc,
        need: need,
        reassemble: reassemble,
        toImage: toImage,
        decrypt: decrypt,
        decryptUrl: decryptUrl,
        load: load,
        valid: valid,
        // Aliases for backward compatibility / convenience
        calculateLayers: calc,
        needsDecryption: need,
        isValidImage: valid,
        reassembleToImage: toImage,
        decryptImage: decrypt,
        decryptImageUrl: decryptUrl
    };

    // Export for different environments
    var target = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : g);
    target.JmDecrypt = J;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = J;
    }
})();