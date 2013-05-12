//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    var THREE = global.THREE,
        Visualizer = global.DodgeBeat.Visualizer;

    global.DodgeBeat.LightVisualizer = (function () {

        /**
         * LightVisualizer
         * @param scene
         * @returns {*}
         * @constructor
         */
        function LightVisualizer(scene) {
            return LightVisualizer.alloc(this, arguments);
        }

        Visualizer.inherit(LightVisualizer);

        /**
         * init
         * @param scene
         */

        LightVisualizer.prototype.init = function (scene) {
            Visualizer.prototype.init.apply(this, arguments);

            var depth = global.DodgeBeat.config.camera.depth;

            this.scene = scene;
            this.loadTextures();

            this.faintSun = this.addLight({
                h: 0.995,
                s: 0.5,
                l: 0.9,
                x: 0,
                y: 0,
                z: depth * 1.1,
                maxIntensity: 0.52,
                decay: 0.006
            });

            this.lowSun = this.addLight({
                h: 0.55,
                s: 0.9,
                l: 0.5,
                x: -900,
                y: -500,
                z: 300,
                maxIntensity: 1,
                decay: 0.07
            });

            this.midSun = this.addLight({
                h: 0.69,
                s: 0.7,
                l: 0.5,
                x: 0,
                y: 1000,
                z: -200,
                maxIntensity: 1.5,
                decay: 0.09
            });

            this.highSun = this.addLight({
                h: 0.15,
                s: 0.8,
                l: 0.5,
                x: 700,
                y: -400,
                z: 800,
                maxIntensity: 0.9,
                decay: 0.03
            });


            this.peakSun = this.addLight({
                h: 1,
                s: 1,
                l: 1,
                x: 2000,
                y: 1800,
                z: -1000,
                maxIntensity: 1.7,
                decay: 0.09
            });

            this.setLightScale(this.faintSun, 0);
            this.setLightScale(this.lowSun, 0);
            this.setLightScale(this.midSun, 0);
            this.setLightScale(this.highSun, 0);
            this.setLightScale(this.peakSun, 0);
        };

        LightVisualizer.prototype.loadTextures = function () {
            this.textureFlare0 = THREE.ImageUtils.loadTexture('images/lensflare0.png');
            this.textureFlare2 = THREE.ImageUtils.loadTexture('images/lensflare2.png');
            this.textureFlare3 = THREE.ImageUtils.loadTexture('images/lensflare3.png');
            return this;
        };

        LightVisualizer.prototype.addLight = function (options) {
            var i, n, light, flareColor, lensFlare;

            light = new THREE.PointLight(0xffffff, 1.5, 4500);
            light.color.setHSL(options.h, options.s, options.l);
            light.position.set(options.x, options.y, options.z);

            flareColor = new THREE.Color(0xffffff);
            flareColor.setHSL(options.h, options.s, options.l);

            lensFlare = new THREE.LensFlare(this.textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);
            lensFlare.add(this.textureFlare2, 512, 0.0, THREE.AdditiveBlending);
            lensFlare.add(this.textureFlare2, 512, 0.0, THREE.AdditiveBlending);
            lensFlare.add(this.textureFlare2, 512, 0.0, THREE.AdditiveBlending);

            lensFlare.add(this.textureFlare3, 60, 0.6, THREE.AdditiveBlending);
            lensFlare.add(this.textureFlare3, 70, 0.7, THREE.AdditiveBlending);
            lensFlare.add(this.textureFlare3, 120, 0.9, THREE.AdditiveBlending);
            lensFlare.add(this.textureFlare3, 70, 1.0, THREE.AdditiveBlending);

            lensFlare.customUpdateCallback = this.lensFlareUpdateCallback;
            lensFlare.position = light.position;

            for (i = 0, n = lensFlare.lensFlares.length; i < n; i += 1) {
                lensFlare.lensFlares[i].maxSize = lensFlare.lensFlares[i].size;
            }

            this.scene.add(lensFlare);
            this.scene.add(light);

            return {
                light: light,
                lensFlare: lensFlare,
                maxIntensity: options.maxIntensity,
                decay: options.decay
            };
        };

        LightVisualizer.prototype.lensFlareUpdateCallback = function (object) {
            var f, fl, flare, vecX, vecY;

            fl = object.lensFlares.length;
            vecX = -object.positionScreen.x * 2;
            vecY = -object.positionScreen.y * 2;

            for (f = 0; f < fl; f++) {
                flare = object.lensFlares[f];
                flare.x = object.positionScreen.x + vecX * flare.distance;
                flare.y = object.positionScreen.y + vecY * flare.distance;
                flare.rotation = 0;
            }

            object.lensFlares[2].y += 0.025;
            object.lensFlares[3].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad(45);
        };

        LightVisualizer.prototype.setLightScale = function (light, scale) {
            var i, n, flares = light.lensFlare.lensFlares;
            light.light.intensity = scale;

            for (i = 0, n = flares.length; i < n; i += 1) {
                flares[i].size = flares[i].maxSize * scale;
            }
        };

        LightVisualizer.prototype.decayLight = function (light) {
            var scale = light.light.intensity - light.decay;
            if (scale < 0) {
                scale = 0;
            }
            this.setLightScale(light, scale);
        };

        LightVisualizer.prototype.flashLight = function (light) {
            this.setLightScale(light, light.maxIntensity);
        };

        LightVisualizer.prototype.kickLight = function (kick, light) {
            if (kick) {
                this.flashLight(light);
            } else {
                this.decayLight(light);
            }
        };

        LightVisualizer.prototype.update = function (t) {
            this.kickLight(this.kicks.peak, this.peakSun);
            this.kickLight(this.kicks.high, this.highSun);
            this.kickLight(this.kicks.mid, this.midSun);
            this.kickLight(this.kicks.low, this.lowSun);
            this.kickLight(this.kicks.faint, this.faintSun);
        };

        return LightVisualizer;

    }());

}(this));