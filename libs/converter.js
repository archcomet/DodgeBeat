(function() {
    'use strict';

    // Modules
    var spawn = require('child_process').spawn,
        path = require('path'),

        // Command
        commandPath = path.join(__dirname, '..', 'ffmpeg'),
        commandOpts = ['-i', 'pipe:0', '-f', 'mp3', '-acodec', 'libvorbis', '-ab', '128k', '-aq', '60', '-f', 'ogg', '-'];

    module.exports = (function() {

        /**
         * Converter
         * Spawns a new process to convert Mp3 into Ogg
         * @returns {*}
         * @constructor
         */

        function Converter() {
            this.process = spawn(commandPath, commandOpts);

            this.process.stderr.on('data', function (data) {
                console.log(data.toString('ascii'));
            });

            this.process.stdin.on('error', function (err) {
                console.log('converter stdin error', err);
            });

            this.process.stdout.on('error', function (err) {
                console.log('converter stdout error', err);
            });

            return this;
        }

        /**
         * create (static)
         * Instantiate a converter
         * @returns {Converter}
         */

        Converter.create = function() {
            return new Converter();
        };

        /**
         * Kill
         * Destroys the Converter's process.
         * @returns {*}
         */

        Converter.prototype.kill = function () {
            this.process.stdin.destroy();
            this.process.stdout.destroy();
            this.process.kill('SIGKILL');
            return this;
        };

        return Converter;

    }());

}());
