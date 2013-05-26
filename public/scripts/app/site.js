//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    global.app = global.app || {};

    global.app.SiteControl = can.Control({

        init : function (elem, options) {
            this.searchResults = null;
            this.element.hide().html(can.view('/views/site.tmpl', {})).fadeIn();
            this.$nowPlayingContainer = can.$('#nowPlayingContainer');
            return this;
        },

        startDodgeBeat: function () {
            this.dodgeBeat = new global.DodgeBeat(this);
            return this;
        },

        play: function (track) {
            this.currentTrack = track;
            this.removeError();
            this.hideSearchResults(this.showLoadSpinner);
            this.dodgeBeat.stream(track);
            return this;
        },

        pause: function () {
            if (this.playing) {
                this.dodgeBeat.pause();
            }
        },

        resume: function () {
            if (this.playing) {
                this.dodgeBeat.play();
            } else {
                this.play(this.currentTrack);
            }
        },

        onReady: function (callback) {
            this.playing = true;
            this.showNowPlaying();
            this.hideLoadSpinner(function () {
                callback();
            });
            return this;
        },

        onError: function (error) {
            var self = this;
            this.hideLoadSpinner(function () {
                self.error = new app.ErrorControl('#errorContainer', {
                    error: error
                });
            });
        },

        removeError: function () {
            if (this.error) {
                this.error.element.empty();
                this.error.destroy();
                this.error = null;
            }
        },

        onEnded: function () {
            if (!this.searchResults.next()) {
                this.nowPlaying.showPlayButton();
                this.playing = false;
            }
            return this;
        },

        showNowPlaying: function () {
            if (this.nowPlaying && this.nowPlaying.track === this.currentTrack) {
                return;
            }

            if (this.nowPlaying) {
                this.nowPlaying.destroy();
                this.nowPlaying = null;
            }

            this.nowPlaying = new app.NowPlayingControl(this.$nowPlayingContainer, {
                track: this.currentTrack,
                parent: this
            });
        },

        showLoadSpinner: function (callback) {
            can.$('#loadSpinner').fadeIn(callback);
            return this;
        },

        hideLoadSpinner: function (callback) {
            can.$('#loadSpinner').fadeOut(callback);
            return this;
        },

        search: function (query) {
            if (query === '') {
                return this;
            }
            this.removeError();
            this.showLoadSpinner();
            this.removeSearchResults();
            this.searchResults = new app.SearchResultsControl('#searchContainer', {
                q: query,
                parent: this
            });
            return this;
        },

        onSearchResultsFound: function (callback) {
            this.hideLoadSpinner(callback);
            this.searchResultsVisible = true;
            can.$('#searchShowHide').html('hide results');
        },

        showSearchResults: function () {
            if (this.searchResults) {
                this.searchResults.element.show();
                this.searchResults.showResults();
                this.searchResultsVisible = true;
                can.$('#searchShowHide').html('hide results');
            }
        },

        hideSearchResults: function (callback) {
            if (this.searchResults) {
                this.searchResults.element.fadeOut(callback);
                this.searchResultsVisible = false;
                can.$('#searchShowHide').html('show results');
            }
        },

        removeSearchResults: function () {
            can.$('#searchShowHide').html('');
            if (this.searchResults) {
                var element = this.searchResults.element;
                this.searchResults.element.empty();
                this.searchResults.destroy();
                this.searchResults = null;
                element.show();
            }
        },

        '#searchForm submit' : function () {
            this.search(can.$('#searchQuery').val());
            return false;
        },

        '#searchShowHide click' : function (link) {
            if (this.searchResultsVisible) {
                this.hideSearchResults();
            } else {
                this.showSearchResults();
            }
        }

     });

}(this));