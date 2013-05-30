//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    global.yepnope({
        load: [
            '//connect.soundcloud.com/sdk.js',
            '/scripts/libs/jquery.min.js',
            '/scripts/libs/can.custom.js',
            '/scripts/app/config.js',
            '/scripts/app/site.js',
            '/scripts/app/search.js',
            '/scripts/app/track.js',
            '/scripts/app/playing.js',
            '/scripts/app/error.js',
            'css!styles.css'
        ],
        complete: function () {
            global.site = new global.app.SiteControl(document.body);
            global.yepnope({
                load: [
                    '/scripts/libs/jquery.min.js',
                    '/scripts/libs/deferred.js',
                    '/scripts/libs/three.min.js',
                    '/scripts/libs/Tween.js',
                    '/scripts/libs/dancer.min.js',
                    '/scripts/libs/base.js',
                    '/scripts/dodgeBeat/dodgeBeat.js',
                    '/scripts/dodgeBeat/visualizer.js',
                    '/scripts/dodgeBeat/cubes.js',
                    '/scripts/dodgeBeat/lights.js',
                    '/scripts/dodgeBeat/particles.js',
                    '/scripts/dodgeBeat/player.js',
                    '/scripts/dodgeBeat/steering.js',
                    '/scripts/dodgeBeat/camera.js',
                    '/scripts/dodgeBeat/audio.js'
                ],
                complete: function () {
                    global.site.startDodgeBeat();
                }
            });
        }
    });

}(this));