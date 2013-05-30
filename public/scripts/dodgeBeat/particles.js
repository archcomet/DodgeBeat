//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    global.DodgeBeat.ParticleVisualizer = (function () {

        var SCENE = DodgeBeat.CONFIG.SCENE,
            PARTICLES = DodgeBeat.CONFIG.PARTICLES;

        /**
         * ParticleVisualizer
         * @param scene
         * @returns {*}
         * @constructor
         */

        function ParticleVisualizer(scene) {
            return ParticleVisualizer.alloc(this, arguments);
        }

        DodgeBeat.Visualizer.inherit(ParticleVisualizer);

        /**
         * init
         * @param parent
         */

        ParticleVisualizer.prototype.init = function (parent) {
            DodgeBeat.Visualizer.prototype.init.apply(this, arguments);

            var i, n, pX, pY, pZ;
            this.parent = parent;
            this.particles = new THREE.Geometry();
            this.particles.colors = [];

            this.material = generateParticleMaterial();

            for (i = 0, n = PARTICLES.COUNT; i < n; i++) {
                pX = Math.random() * 2 * SCENE.WIDTH - SCENE.WIDTH;
                pY = Math.random() * 2 * SCENE.HEIGHT - SCENE.HEIGHT;
                pZ = i * (SCENE.LENGTH) / n - SCENE.LIMIT;

                this.particles.vertices.push(new THREE.Vector3(pX, pY, pZ));
                this.particles.colors[i] = new THREE.Color(0xffffff);
                this.particles.colors[i].setRGB(
                    (pX + SCENE.WIDTH  / 2) / SCENE.WIDTH,
                    (pY + SCENE.HEIGHT / 2) / SCENE.HEIGHT,
                    (pZ + SCENE.LIMIT  / 2) / SCENE.LIMIT
                );
            }

            this.particleSystem = new THREE.ParticleSystem(
                this.particles,
                this.material
            );

            this.particleSystem.dynamic = true;
            this.particleSystem.sortParticles = true;
            this.parent.scene.add(this.particleSystem);
        };

        ParticleVisualizer.prototype.update = function (t) {
            var i, n, particle;

            for (i = 0, n = PARTICLES.COUNT; i < n; i++) {
                particle = this.particles.vertices[i];
                if (particle.z >= SCENE.LIMIT) {
                    particle.z -= SCENE.LENGTH;
                }
                particle.z += this.parent.velocity;
            }

            if (this.kicks.peak) {
                this.material.size = PARTICLES.MAX_SIZE;
                this.tripped = true;
            } else if (this.kicks.high && this.tripped) {
                this.material.size = PARTICLES.MAX_SIZE * 0.6;
            } else {
                this.material.size -= 5;
                if (this.material.size < 0) {
                    this.material.size = 0;
                    this.tripped = false;
                }
            }
        };


        /**
         * generateSprite (Helper)
         * @returns {HTMLElement}
         */

        function generateSprite() {
            var canvas, radius, halfW, halfH, context;
            canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;

            radius = 14;
            halfW = canvas.width / 2;
            halfH = canvas.height / 2;

            context = canvas.getContext( '2d' );
            context.beginPath();
            context.arc(halfW, halfH, radius, 0, 2 * Math.PI, false);
            context.fillStyle = 'white';
            context.fill();
            context.lineWidth = 1;
            context.strokeStyle = 'black';
            context.stroke();

            return canvas;
        }

        /**
         * generateParticleMaterial (Helper)
         * @returns {THREE.ParticleBasicMaterial}
         */

        function generateParticleMaterial() {
            var texture = new THREE.Texture(generateSprite());
            texture.needsUpdate = true;

            return new THREE.ParticleBasicMaterial({
                color: 0xFFFFFF,
                size: 0,
                sizeAttenuation: true,
                map: texture,
                blending: THREE.AdditiveBlending,
                vertexColors: true,
                transparent: true
            });
        }

        return ParticleVisualizer;

    }());

}(this));