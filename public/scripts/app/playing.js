//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    global.app = global.app || {};

    global.app.NowPlayingControl = can.Control({
        init: function (element, options) {
            this.parent = options.parent;
            this.track = options.track;
            this.view = can.view('views/nowPlaying.tmpl', this.track);
            this.element.hide().html(this.view).fadeIn();
            this.$playControl = this.element.find('.playControl');
        },

        showPlayButton: function () {
            this.$playControl.removeClass('playing').addClass('paused');
        },

        showPauseButton: function () {
            this.$playControl.removeClass('paused').addClass('playing');
        },

        '.playControl click' : function () {
            if (this.$playControl.hasClass('playing')) {
                this.showPlayButton();
                this.parent.pause();
            } else {
                this.showPauseButton();
                this.parent.resume();
            }
        }

    });

}(this));