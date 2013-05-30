(function(global) {
    'use strict';

    global.DodgeBeat.audio = (function(){

        var format = 'ogg',
            audioPools = {},
            enabled = true,
            path = '/audio/';

        /**
         * AudioPool
         * @param name
         * @constructor
         */

        function AudioPool(name) {
            this.audioPath = path + name + '.' + format;

            var audio = new Audio(this.audioPath);
            audio.preload = 'auto';

            this.name = name;
            this.started = [];
            this.stopped = [];
            this.stopped.push(audio);
        }

        AudioPool.prototype.getAudio = function() {
            return (this.stopped.length > 0) ? this.stopped.pop() : new Audio(this.audioPath);
        };

        AudioPool.prototype.play = function(loop, callback) {
            var self = this,
                audio = this.getAudio();
            audio.callback = callback;

            $(audio).on('ended', function() {
                self.started.splice(self.started.indexOf(audio), 1);
                self.stopped.push(audio);
                audio.loop = false;
                $(audio).off('ended');

                if (typeof audio.callback === 'function') {
                    audio.callback();
                }
            });

            audio.loop = loop || false;
            audio.play();
            this.started.push(audio);
        };

        AudioPool.prototype.stopAll = function() {
            var i = this.started.length, audio;
            while(i--) {
                audio = this.started[i];
                audio.callback = undefined;
                audio.pause();
                audio.currentTime = 0;
            }
        };

        function getPool(name) {
            var pool = audioPools[name];
            if (typeof pool === 'undefined') {
                pool = new AudioPool(name);
                audioPools[name] = pool;
            }
            return pool;
        }

        function canPlay() {
            return (typeof format === 'undefined') ? false : enabled;
        }

        function load(audioCmd) {
            if (!canPlay()) { return; }

            if (typeof audioCmd === 'string') {
                getPool(audioCmd);
            }
            else if (typeof audioCmd.name !== 'undefined') {
                getPool(audioCmd.name);
            }
            else if (typeof audioCmd.names !== 'undefined') {
                for (var i = 0, n = audioCmd.names.length; i < n; i++) {
                    getPool(audioCmd.names[i]);
                }
            }
        }

        function play(audioCmd) {
            var name, pool;

            if (!canPlay()) { return; }

            if (typeof audioCmd === 'string') {
                pool = getPool(audioCmd);
                pool.play();
            }
            else if (typeof audioCmd.name !== 'undefined') {
                pool = getPool(audioCmd.name);
                pool.play(audioCmd.loop);
            }
            else if (typeof audioCmd.names !== 'undefined') {

                if (audioCmd.type === 'randomSelection' || audioCmd.type === undefined) {
                    name = audioCmd.names[Math.floor(Math.random()*audioCmd.names.length)];
                    pool = getPool(name);
                    pool.play();
                }
                else if (audioCmd.type === 'sequence') {
                    audioCmd.next = 0;
                    playNextSequence(audioCmd);
                }

            }
        }

        function playNextSequence(audioCmd) {
            var name, pool, next;

            if (audioCmd.next >= audioCmd.names.length) {
                if (audioCmd.loop) {
                    audioCmd.next = 0;
                }
                else {
                    return;
                }
            }

            next = (audioCmd.shuffle) ? Math.floor(Math.random()*audioCmd.names.length) : audioCmd.next;
            name = audioCmd.names[next];
            pool = getPool(name);
            audioCmd.next++;

            pool.play(false, function(){
                playNextSequence(audioCmd);
            });
        }

        function stopAll() {
            for (var pool in audioPools) {
                if (audioPools.hasOwnProperty(pool)) {
                    audioPools[pool].stopAll();
                }
            }
        }

        function setEnabled(value) {
            enabled = (value === 'enabled');
        }

        function getEnabled() {
            return (enabled) ? 'enabled' : 'disabled';
        }

        return {
            load: load,
            play: play,
            stopAll: stopAll,
            setEnabled: setEnabled,
            getEnabled: getEnabled
        };

    })();

}(window));