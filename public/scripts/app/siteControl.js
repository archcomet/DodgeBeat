//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    global.app = global.app || {};

    global.app.SiteControl = can.Control({

        //================================================
        // Initialization
        //================================================

        init : function (elem, options) {
            this.element.hide().html(can.view('/views/site.tmpl', {})).fadeIn();
            this.$pageContainer = can.$('#pageContainer');
            this.nowPlaying = new app.NowPlayingControl('#nowPlayingContainer', { parent: this });
            app.pageManager.setParent(this);
        },

        showLoadSpinner: function (callback) {
            can.$('#loadSpinner').fadeIn(callback);
        },

        hideLoadSpinner: function (callback) {
            can.$('#loadSpinner').fadeOut(callback);
        },

        //================================================
        // Dodge Beat Interface
        //================================================

        startDodgeBeat: function () {
            this.dodgeBeat = new global.DodgeBeat(this);
        },

        play: function (track) {
            app.pageManager.remove(this.showLoadSpinner);
            this.currentTrack = track;
            this.dodgeBeat.stream(track);
        },

        onReady: function (callback) {
            this.playing = true;
            this.nowPlaying.setTrack(this.currentTrack);
            this.hideLoadSpinner(function () {
                callback();
            });
        },

        onEnded: function (results) {
            this.nowPlaying.removeTrack();
            this.playing = false;
        },

        onError: function (error) {
            this.playing = false;
            this.nowPlaying.removeTrack();

            app.pageManager.display('ErrorPage', { error: error });
        },

        //================================================
        // Templated Events
        //================================================

        '#searchForm submit' : function () {
            var query = can.$('#searchQuery').val();
            if (query === '') {
                return false;
            }

            app.pageManager.display('SearchResultsPage', { model: app.TrackModel.search({ q: query }) });
            return false;
        },

        '#searchShowHide click' : function (link) {
            var text = link.html();
            if (text === 'hide results') {
                app.pageManager.remove();
            } else if (text === 'show results') {
                app.pageManager.display('SearchResultsPage', { slideIn: false });
            }
        }

     });

    global.app.NowPlayingControl = can.Control({
        init: function (element, options) {
            this.parent = options.parent;
            this.$titleSearch = can.$('#titleSearch');
        },

        setTrack: function (track) {
            this.track = track;
            this.element.hide().html(can.view('views/nowPlaying.tmpl', this.track));
            this.$playControl = this.element.find('.playControl');

            var self = this;
            this.$titleSearch.slideUp(function () {
                self.element.fadeIn();
            });
        },

        removeTrack: function () {
            this.track = null;

            var self = this;
            this.element.fadeOut(function () {
                self.$titleSearch.slideDown();
            });
        },

        '.playControl click' : function () {
            if (this.$playControl.hasClass('playing') && this.parent.playing) {
                this.$playControl.removeClass('playing').addClass('paused');
                this.parent.dodgeBeat.pause();
                this.$titleSearch.slideDown();
            } else if (this.$playControl.hasClass('paused') && this.parent.playing) {
                this.$playControl.removeClass('paused').addClass('playing');
                this.parent.dodgeBeat.play();
                this.$titleSearch.slideUp();
            }
        }
    });

}(this));