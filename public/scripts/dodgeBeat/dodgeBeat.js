//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    var THREE = global.THREE,
        Dancer = global.Dancer,
        Base = global.Base;

    global.DodgeBeat = (function () {

        /**
         * Dodge Beat Constructor
         * @returns {*}
         * @constructor
         */

        function DodgeBeat(parent) {
            return DodgeBeat.alloc(this, arguments);
        }

        Base.inherit(DodgeBeat);

        /**
         * init
         * @returns {*}
         */

        DodgeBeat.prototype.init = function (parent) {
            this.parent = parent;
            this.initScene()
                .initVisualizers()
                .initAudio()
                .update(0);

            return this;
        };

        /**
         * initScene
         * Sets up the scene and camera components
         * @returns {*}
         */

        DodgeBeat.prototype.initScene = function () {
            var depth = DodgeBeat.config.camera.depth,
                fogColor = DodgeBeat.config.scene.fogColor,
                fogRate = DodgeBeat.config.scene.fogRate;

            this.camera = new THREE.PerspectiveCamera();
            this.camera.position = new THREE.Vector3(0, 0, depth);
            this.scene = new THREE.Scene();
            this.scene.add(this.camera);
            this.scene.fog = new THREE.FogExp2(fogColor, fogRate);

            this.renderer = new THREE.WebGLRenderer();
            $(document.body).prepend(this.renderer.domElement);

            $(window).resize(this.onWindowResize.bind(this));
            this.onWindowResize();

            return this;
        };

        /**
         * initVisualizers
         * Sets up the visualizer components
         * @returns {*}
         */

        DodgeBeat.prototype.initVisualizers = function () {
            this.visualizers = {
                cubes: new DodgeBeat.CubeVisualizer(this.scene),
                particles: new DodgeBeat.ParticleVisualizer(this.scene),
                lights: new DodgeBeat.LightVisualizer(this.scene)
            };
            return this;
        };

        /**
         * initAudio
         * Sets up the audio components
         * @returns {*}
         */

        DodgeBeat.prototype.initAudio = function () {
            var key, kicksConfig = global.DodgeBeat.config.kicks;

            this.dancer = new Dancer();
            this.dancer.bind('loaded', this.onLoaded.bind(this));
            this.kicks = {};

            for (key in kicksConfig) {
                if (kicksConfig.hasOwnProperty(key)) {
                    this.kicks[key] = this.dancer.createKick({
                        frequency: kicksConfig[key].frequency,
                        threshold:  kicksConfig[key].threshold,
                        decay:  kicksConfig[key].decay,
                        onKick: this.onKickEvent.bind(this, key, true),
                        offKick: this.onKickEvent.bind(this, key, false)
                    });
                    this.kicks[key].on();
                }
            }

            return this;
        };

        /**
         * update (requestAnimationFrame)
         * Main loop for visualizers
         * @param t
         */

        DodgeBeat.prototype.update = function (t) {
            window.requestAnimationFrame(this.update.bind(this));

            var moveRate = DodgeBeat.config.camera.movePeriod,
                moveDist = DodgeBeat.config.camera.moveDistance;

            if (this.paused) { return; }

            this.visualizers.cubes.update(t);
            this.visualizers.particles.update(t);
            this.visualizers.lights.update(t);
            this.camera.position.x = Math.cos(t / moveRate) * moveDist;
            this.camera.position.y = Math.sin(t / moveRate) * moveDist;
            this.camera.rotation.z = Math.cos(t / moveRate / 8) * Math.sin(t / moveRate) / 3;

            this.renderer.clear();
            this.renderer.render(this.scene, this.camera);
        };

        /**
         * stream
         * Sets audioElement to a SoundCloud stream src
         * @param track - SoundCloud track object
         * @returns {*}
         */

        DodgeBeat.prototype.stream = function (track) {
            this.stop();
            this.currentAudio = new Audio(track.src());
            $(this.currentAudio).on('ended', this.onEnded.bind(this));
            this.dancer.load(this.currentAudio);
            return this;
        };

        /**
         * play
         * Plays audio and visualizer if audio is ready.
         * @returns {*}
         */

        DodgeBeat.prototype.play = function () {
            if (this.ready && this.dancer.isLoaded()) {
                this.started = true;
                this.paused = false;
                this.dancer.play();
                if (this.parent && this.parent.onStarted) {
                    this.parent.onStarted();
                }
            }
            return this;
        };

        /**
         * pause
         * Pauses audio and visualizer
         * @returns {*}
         */

        DodgeBeat.prototype.pause = function () {
            if (this.ready && this.started) {
                this.paused = true;
                this.dancer.pause();
            }
            return this;
        };

        /**
         * stop
         * Stops audio and unloads the Audio Object
         */

        DodgeBeat.prototype.stop = function () {
            $(this.currentAudio).attr('src', '');
            $(this.currentAudio).unbind();
            this.dancer.load({});
            this.ready = false;
            this.started = false;
            this.paused = false;
            if (this.parent && this.parent.onStopped) {
                this.parent.onStopped();
            }
        };

        /**
         * loaded (callback)
         * Starts loaded song. Called by Dancer
         */

        DodgeBeat.prototype.onLoaded = function () {
            this.ready = true;
            if (this.parent && this.parent.onReady) {
                this.parent.onReady(this.play.bind(this));
            } else {
                this.play();
            }
        };

        /**
         * onEnded (callback)
         * Called by Audio object when audio ends.
         */

        DodgeBeat.prototype.onEnded = function () {
            this.stop();
        };

        /**
         * onKickEvent (callback)
         * Triggers kick event in the visualizers. Called by Dancer
         * @param kickName
         * @param on
         * @param mag
         */

        DodgeBeat.prototype.onKickEvent = function (kickName, on, mag) {
            var key;
            for (key in this.visualizers) {
                if (this.visualizers.hasOwnProperty(key)) {
                    this.visualizers[key].onKick(kickName, on, mag);
                }
            }
        };

        /**
         * onWindowResize (callback)
         * Adjusts Camera and Renderer to fit the screen size.
         */

        DodgeBeat.prototype.onWindowResize = function () {
            this.camera.fov = DodgeBeat.config.camera.fov;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.near = DodgeBeat.config.camera.near;
            this.camera.far = DodgeBeat.config.camera.depth * -2;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight, false);
        };


        return DodgeBeat;

    }());

}(this));