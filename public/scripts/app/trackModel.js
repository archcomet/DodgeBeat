//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    global.app = global.app || {};

    // Dependencies
    var SC = global.SC;

    // Initialize SoundCloud API
    SC.initialize({
        client_id: app.config.soundCloud.clientId,
        redirect_uri: app.config.soundCloud.redirectUri
    });

    global.app.TrackModel = (function() {

        var cachedTracks = {};

        /**
         * TrackModel
         * Creates a new TrackModel
         * @param track - A track data object from SoundCloud
         * @type {*}
         */

        var TrackModel = can.Model({}, {
            src: function () {
                return ['/stream/', this.id].join('');
            }
        });


        /**
         * search
         * Gets tracks by search query from SoundCloud.
         * Resolves a TrackModel.List
         * @param params
         * @param success
         * @param error
         * @returns {can.Deferred}
         */

        TrackModel.search = function(params, success, error) {
            var d = new can.Deferred(),
                path = ['/tracks?q=', params.q].join('');

            SC.get(path, function(response, err) {
                if (err) {
                    if (error) {
                        error(err);
                    }
                    d.reject(err);
                    return;
                }

                var i, n, path, modelList, models = [];
                for (i = 0, n = response.length; i < n; i++) {
                    response[i].index = i;
                    path = ['/tracks/', response[i].id].join('');
                    models[i] = cachedTracks[path] = new TrackModel(response[i]);
                }

                modelList = new TrackModel.List(models);
                modelList.q = params.q;
                d.resolve(modelList);

                if (success) {
                    success(modelList);
                }
            });

            return d;
        };

        /**
         * findOne
         * Gets metadata for one track by Id from SoundCloud
         * @param params
         * @param success
         * @param error
         * @returns {can.Deferred}
         */

        TrackModel.findOne = function (params, success, error) {
            params.id = params.id || 0;
            var d = new can.Deferred(),
                path = ['/tracks/', params.id].join(''),
                track = cachedTracks[path];

            if (track) {
                d.resolve(track);
            } else {
                SC.get(path, function (response, err) {
                    if (err) {
                        if (error) {
                            error(response, err);
                        }
                        return;
                    }

                    track = new TrackModel(response);
                    cachedTracks[path] = track;
                    d.resolve(track);

                    if (success) {
                        success(track);
                    }
                });
            }

            return d;
        };

        return TrackModel;

    }());

}(this));