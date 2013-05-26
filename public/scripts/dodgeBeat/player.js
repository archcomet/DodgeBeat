//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    global.DodgeBeat.Player = (function() {

        var collisionSounds = {
            names: [
            'firework1',
            'firework2',
            'firework3'
            ]
        };

        function Player() {
            return Player.alloc(this, arguments);
        }

        Base.inherit(Player);

        /**
         * Init
         * @param parent
         */

        Player.prototype.init = function (parent) {
            this.audio = new Audio();
            this.parent = parent;
            this.lines = [];
            this.radius = 20;
            this.position = new THREE.Vector3(0, 0, 2500);
            this.target = new THREE.Vector3(0, 0, 2500);
            this.contact = false;
            this.enableCollision = false;
            this.color = new THREE.Color();
            this.steering = new DodgeBeat.Steering({
                position: this.position,
                target: this.target,
                maxSpeed: 10,
                slowingDistance: 600
            });

            this.tailSize = 25;

            this.createLight()
                .createSphere()
                .setColor(0x88AAFF)
                .createTail();

            DodgeBeat.audio.load(collisionSounds);
            $(document.body).mousemove(this.mousemove.bind(this));
        };

        /**
         * createLight
         * @returns {*}
         */

        Player.prototype.createLight = function () {
            this.light = new THREE.PointLight(this.color.getHex(), 1, 600 );
            this.light.position = this.position;
            this.parent.scene.add(this.light);
            return this;
        };

        /**
         * createSphere
         * @return {*}
         */

        Player.prototype.createSphere = function () {
            var i, n, p, parameters, vertex1, vertex2, material, line,
                geometry = new THREE.Geometry();

            // Initialize sphere geometry
            for ( i = 0, n = 400; i < n; i ++ ) {
                vertex1 = new THREE.Vector3();
                vertex1.x = Math.random() * 2 - 1;
                vertex1.y = Math.random() * 2 - 1;
                vertex1.z = Math.random() * 2 - 1;
                vertex1.normalize();
                vertex1.multiplyScalar(this.radius);
                vertex2 = vertex1.clone();
                vertex2.multiplyScalar(0.8);
                geometry.vertices.push(vertex1);
                geometry.vertices.push(vertex2);
            }

            // Parameters for two spheres (outer, inner)
            parameters = [
                [0x0088FF, 0.9, 0.5, 1],
                [0xFFFFFF, 0.5, 0.5, 0.6]
            ];

            // Create each sphere
            for (i = 0, n = 2; i < n; i++) {
                p = parameters[i];
                material = new THREE.LineBasicMaterial({
                    color: p[0],
                    opacity: p[1],
                    linewidth: p[2]}
                );
                line = new THREE.Line(geometry, material, THREE.LinePieces);
                line.scale.x = line.scale.y = line.scale.z = p[3];
                line.originalScale = p[3];
                line.rotation.y = Math.random() * Math.PI;
                line.updateMatrix();
                line.position = this.position;
                this.parent.scene.add(line);
                this.lines[i] = line;
            }

            return this;
        };

        /**
         * createTail
         * @return {*}
         */

        Player.prototype.createTail = function () {
            var self = this, values_size, values_color, vertices;

            this.tail = new THREE.Geometry();
            this.shaderMaterial = generateShaderMaterial();

            // Get direct refs to vertices, sizes, and colors for update function
            vertices = this.tail.vertices;
            values_size = this.shaderMaterial.attributes.size.value;
            values_color = this.shaderMaterial.attributes.pcolor.value;

            /**
             * tweenParticle (private delayed function)
             * A private recursive closure to tween and update particles.
             * Called when a particle is emitted
             *
             * @param index
             * @param delay
             */

            function tweenParticle (index, delay) {
                var scatter, particle, shakeFactor = self.parent.camera.shakeFactor;

                delay = delay !== undefined ? delay : 0;
                scatter = 1 + shakeFactor * 50;

                particle = vertices[index].copy(self.position);
                particle.size = self.tailSize * (1 + shakeFactor * 10);
                particle.time = particle.duration = 1000;
                particle.color.copy(self.color);

                if (shakeFactor > 0) {
                    particle.color.r += (1.0 - particle.color.r) * shakeFactor;
                    particle.color.g += (1.0 - particle.color.g) * shakeFactor;
                    particle.color.b += (1.0 - particle.color.b) * shakeFactor;
                }

                new TWEEN.Tween(particle)
                    .delay(delay)
                    .to({
                        x: particle.x + (Math.random() * 40 - 20) * scatter,
                        y: particle.y + (Math.random() * 40 - 20) * scatter,
                        z: particle.z + 300 / scatter,
                        time: 0
                    }, particle.time)
                    .onUpdate(function () {
                        var t = particle.time / particle.duration;
                        values_size[index] = particle.size * t;
                        values_color[index].setRGB(
                            particle.color.r * t,
                            particle.color.g * t,
                            particle.color.b * t
                        );
                    })
                    .onComplete(function () {
                        tweenParticle(index);
                    })
                    .start(self.parent.time);
            }

            // Initialize particles
            for ( var i = 0; i < 400; i++ ) {
                vertices[i] = new THREE.Vector3();
                vertices[i].color = new THREE.Color();

                values_size[i] = 0;
                values_color[i] = new THREE.Color();

                tweenParticle(i, i * 5);
            }

            // Create particle system
            this.tailSystem = new THREE.ParticleSystem(
                this.tail, this.shaderMaterial
            );

            this.tailSystem.dynamic = true;
            this.tailSystem.sortParticles = true;
            this.parent.scene.add(this.tailSystem);

            return this;
        };

        /**
         * setColor
         * Sets color of light, lines and particles.
         * Lines and particles have their lightness reduced.
         *
         * @param value
         */

        Player.prototype.setColor = function (value) {
            var hsl, color = new THREE.Color(value);
            this.light.color.copy(color);

            hsl = color.getHSL();
            color.setHSL(hsl.h, hsl.s, hsl.l * 0.75);

            this.color.copy(color);
            this.lines[0].material.color.copy(color);

            return this;
        };

        /**
         * setZ
         * @param z
         */

        Player.prototype.setTargetZ = function (z) {
            this.target.z = z;
        };

        /**
         * mousemove
         * @param event
         */

        Player.prototype.mousemove = function (event) {
            var range = global.DodgeBeat.config.camera.range,
                x = (event.pageX - window.innerWidth * 0.5) / (window.innerWidth * 0.5),
                y = ((window.innerHeight - event.pageY) - window.innerHeight * 0.5) / (window.innerHeight * 0.5);

            this.steering.target.x = x * range * 0.66;
            this.steering.target.y = y * range * 0.66;
        };

        /**
         * update
         * @param t
         */

        Player.prototype.update = function (t) {
            this.steering.update(t);

            this.lines[0].rotation.y += 0.01;
            this.lines[0].rotation.x += 0.01;
            this.lines[0].rotation.z += 0.02;
            this.lines[1].rotation.y += 0.07;

            if (this.contact) {
                this.contact = false;

                if (this.enableCollision) {
                    this.parent.camera.shakeUpdates = 30;
                    DodgeBeat.audio.play(collisionSounds);
                }
            }
        };

        /**
         * generateSprite (Helper)
         * @returns {HTMLElement}
         */

        function generateSprite() {
            var canvas, halfW, halfH, context, gradient;
            canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;

            halfW = canvas.width / 2;
            halfH = canvas.height / 2;

            context = canvas.getContext( '2d' );
            gradient = context.createRadialGradient(halfW, halfH, 0, halfW, halfH, halfW);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, 'rgba(170,170,170,1)');
            gradient.addColorStop(0.4, 'rgba(40,40,40,1)');
            gradient.addColorStop(1, 'rgba(0,0,0,1)');
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
            return canvas;
        }

        /**
         * generateShaderMaterial (Helper)
         * @returns {THREE.ShaderMaterial}
         */

        function generateShaderMaterial() {
            var texture = new THREE.Texture(generateSprite());
            texture.needsUpdate = true;

            return new THREE.ShaderMaterial( {
                uniforms: {
                    texture: { type: "t", value: texture }
                },
                attributes: {
                    size: { type: 'f', value: [] },
                    pcolor: { type: 'c', value: [] }
                },
                texture: texture,
                vertexShader: document.getElementById( 'sizeColorVertexShader' ).textContent,
                fragmentShader: document.getElementById( 'sizeColorFragmentShader' ).textContent,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                transparent: true
            });
        }

        return Player;

    }());

}(this));