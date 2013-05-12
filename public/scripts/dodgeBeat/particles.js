//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    var THREE = global.THREE,
        Visualizer = global.DodgeBeat.Visualizer;

    global.DodgeBeat.ParticleVisualizer = (function () {

        /**
         * ParticleVisualizer
         * @param scene
         * @returns {*}
         * @constructor
         */

        function ParticleVisualizer(scene) {
            return ParticleVisualizer.alloc(this, arguments);
        }

        Visualizer.inherit(ParticleVisualizer);

        /**
         * init
         * @param scene
         */

        ParticleVisualizer.prototype.init = function (scene) {
            Visualizer.prototype.init.apply(this, arguments);

            var i, n, pX, pY, pZ, depth, range;

            depth = global.DodgeBeat.config.camera.depth;
            range = global.DodgeBeat.config.camera.range;

            this.scene = scene;
            this.particles = new THREE.Geometry();
            this.particles.colors = [];

            this.material =  new THREE.ParticleBasicMaterial({
                color: 0xFFFFFF,
                size: 0,
                sizeAttenuation: true,
                map: THREE.ImageUtils.loadTexture(
                    '/images/disc.png'
                ),
                blending: THREE.AdditiveBlending,
                vertexColors: true,
                transparent: true
            });

            for (i = 0, n = global.DodgeBeat.config.particles.count; i < n; i++) {
                pX = Math.random() * 2 * range - range;
                pY = Math.random() * 2 * range - range;
                pZ = i * (2 * depth) / n - depth;

                this.particles.vertices.push(new THREE.Vector3(pX, pY, pZ));
                this.particles.colors[i] = new THREE.Color(0xffffff);
                this.particles.colors[i].setRGB(
                    (pX + range / 2) / range,
                    (pY + range / 2) / range,
                    (pZ + depth / 2) / depth
                );
            }

            this.particleSystem = new THREE.ParticleSystem(
                this.particles,
                this.material
            );

            this.particleSystem.dynamic = true;
            this.particleSystem.sortParticles = true;
            this.scene.add(this.particleSystem);
        };

        ParticleVisualizer.prototype.update = function (t) {
            var i, n, particle, depth, velocity, maxSize;

            depth = global.DodgeBeat.config.camera.depth;
            velocity = global.DodgeBeat.config.camera.maxVelocity;
            maxSize = global.DodgeBeat.config.particles.maxSize;

            for (i = 0, n = global.DodgeBeat.config.particles.count; i < n; i++) {
                particle = this.particles.vertices[i];
                if (particle.z >= depth) {
                    particle.z -= 2 * depth;
                }
                particle.z += velocity;
            }

            if (this.kicks.peak) {
                this.material.size = maxSize;
                this.tripped = true;
            } else if (this.kicks.high && this.tripped) {
                this.material.size = maxSize * 0.6;
            } else {
                this.material.size -= 5;
                if (this.material.size < 0) {
                    this.material.size = 0;
                    this.tripped = false;
                }
            }
        };

        return ParticleVisualizer;

    }());

}(this));