//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    var THREE = global.THREE,
        Dancer = global.Dancer;

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
            this.warpFactor = 1.5;
            this.time = 0;
            this.velocity = 0;
            this.parent = parent;

            this.initScene()
                .initVisualizers()
                .initAudio()
                .initPlayer()
                .changePhase(0)
                .update(0);

            return this;
        };

        /**
         * initScene
         * Sets up the scene and camera components
         * @returns {*}
         */

        DodgeBeat.prototype.initScene = function () {
            var fogColor = DodgeBeat.config.scene.fogColor,
                fogRate = DodgeBeat.config.scene.fogRate;

            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.FogExp2(fogColor, fogRate);
            this.camera = new DodgeBeat.Camera(this);

            this.renderer = new THREE.WebGLRenderer({antialias: false });
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
                cubes: new DodgeBeat.CubeVisualizer(this),
                particles: new DodgeBeat.ParticleVisualizer(this),
                lights: new DodgeBeat.LightVisualizer(this)
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
            this.kicksSorted = [];

            for (key in kicksConfig) {
                if (kicksConfig.hasOwnProperty(key)) {
                    this.kicks[key] = this.dancer.createKick({
                        frequency: kicksConfig[key].frequency,
                        threshold:  kicksConfig[key].threshold,
                        decay:  kicksConfig[key].decay,
                        onKick: this.onKickEvent.bind(this, key, true),
                        offKick: this.onKickEvent.bind(this, key, false)
                    });
                    this.kicks[key].active = -1;
                    this.kicks[key].on();
                    this.kicksSorted.push(this.kicks[key]);
                }
            }
            this.kickLevel = -1;
            this.kicksSorted.sort(function(a, b) {
                return a.threshold - b.threshold;
            });

            return this;
        };

        DodgeBeat.prototype.initPlayer = function () {
            this.player = new DodgeBeat.Player(this);
            this.camera.tracking = this.player.steering.position;
            return this;
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
            this.currentAudio.onerror = this.onError.bind(this,
                'Error encountered with audio stream. Please try again!');
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
                this.changePhase(1);
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
            if (this.currentAudio) {
                this.currentAudio.onerror = null;
                $(this.currentAudio).attr('src', '');
                $(this.currentAudio).unbind();
            }
            this.dancer.load({});
            this.ready = false;
            this.started = false;
            this.paused = false;
            this.changePhase(0);
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

        DodgeBeat.prototype.onError = function (error) {
            this.ready = false;
            if (this.parent && this.parent.onError) {
                this.parent.onError(error);
            }
        };

        /**
         * onEnded (callback)
         * Called by Audio object when audio ends.
         */

        DodgeBeat.prototype.onEnded = function () {
            this.stop();
            if (this.parent && this.parent.onEnded) {
                this.parent.onEnded();
            }
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
            this.kicks[kickName].mag = mag;
            this.kicks[kickName].onBeat = on;
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
            this.camera.onWindowResize();
            this.renderer.setSize(window.innerWidth, window.innerHeight, false);
        };


        /**
         * update (requestAnimationFrame)
         * Main loop for visualizers
         * @param t
         */

        DodgeBeat.prototype.update = function (t) {
            window.requestAnimationFrame(this.update.bind(this));

            if (this.paused) { return; }

            this.time += 1000 / 60;

            TWEEN.update(this.time);
            this.updateAudioKicks(t);
            this.updatePhase(t);
            this.player.update(this.time);
            this.camera.update(this.time);

            this.visualizers.cubes.update(this.time);
            this.visualizers.particles.update(this.time);
            this.visualizers.lights.update(this.time);

            this.renderer.clear();
            this.renderer.render(this.scene, this.camera.perspectiveCam);
        };

        DodgeBeat.prototype.accelerate = function () {

            console.log(this.targetVelocity);

            if (this.velocity > this.targetVelocity) {
                this.velocity -= this.acceleration * (this.kickLevel - 1);

                if (this.velocity < this.targetVelocity) {
                    this.velocity = this.targetVelocity;
                    return false;
                }
            }

            if (this.velocity < this.targetVelocity) {
                this.velocity += this.acceleration * this.kickLevel;

                if (this.velocity > this.targetVelocity) {
                    this.velocity = this.targetVelocity;
                    return true;
                }
            }

            return true;
        };

        DodgeBeat.prototype.updateAudioKicks = function (t) {
            var i, n, kick, kickLevel = 0;

            for (i = 0, n = this.kicksSorted.length; i < n; i++) {
                kick = this.kicksSorted[i];
                if (kick.onBeat) {
                    kickLevel = i;
                }
            }

            kickLevel++;

            if (this.kickLevel !== kickLevel) {
                this.kickLevel = kickLevel;
            }
        };

        DodgeBeat.prototype.updatePhase = function (t) {
            switch (this.phase) {
                // Pre-Flight
                case 0:
                    break;

                // Launch
                case 1:
                    if (this.accelerate()) {
                        this.changePhase(2);
                    }
                    break;

                // nth Main
                default:
                    if (this.player.contact) {
                        this.velocity = 2;
                    }
                    this.targetVelocity = (this.kickLevel * this.kickLevel) * this.warpFactor;

                    this.accelerate();
                    break;
            }

        };

        DodgeBeat.prototype.changePhase = function(phase) {

            switch(phase) {
                // Pre-Flight
                case 0:
                    this.velocity = 0;
                    this.player.enableControl = false;
                    this.phase = phase;
                    break;

                // Launch
                case 1:
                    if (this.phase === 0) {
                        this.phase = phase;
                    }
                    this.targetVelocity = 2;
                    this.acceleration = 0.1;
                    break;

                // Main
                default:
                    this.player.enableControl = true;
                    this.phase = phase;
                    break;
            }

            return this;
        };


        return DodgeBeat;

    }());

}(this));