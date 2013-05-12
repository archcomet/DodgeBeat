//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    global.DodgeBeat.color = (function () {

        /**
         * Converts HSL to RGB
         * @param h
         * @param s
         * @param l
         * @returns {{r: number, g: number, b: number}}
         */

        function hslToRgb(h, s, l) {
            var r, g, b, q, p;

            function hue2rgb(p, q, t) {
                if (t < 0) { t += 1; }
                if (t > 1) { t -= 1; }
                if (t < 1 / 6) { return p + (q - p) * 6 * t; }
                if (t < 1 / 2) { return q; }
                if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6; }
                return p;
            }

            if (s === 0) {
                r = g = b = l;
            } else {
                q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return {
                r: r * 255,
                g: g * 255,
                b: b * 255
            };
        }

        /**
         * Converts RGB to HSL
         * @param r
         * @param g
         * @param b
         * @returns {Array}
         */

        function rgbToHsl(r, g, b) {
            var max, min, h, s, l, d;
            r /= 255;
            g /= 255;
            b /= 255;

            max = Math.max(r, g, b);
            min = Math.min(r, g, b);
            l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
                }
                h /= 6;
            }

            return [h, s, l];
        }

        return {
            hslToRgb: hslToRgb,
            rgbToHsl: rgbToHsl
        };

    }());

}(this));