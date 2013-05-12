//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    global.app = global.app || {};

    global.app.SiteControl = can.Control({

        init : function (elem, options) {
            this.searchResults = null;
            this.element.html(can.view('/views/site.tmpl', {}));
            return this;
        },

        startDodgeBeat: function () {
            this.dodgeBeat = new global.DodgeBeat(this);
            return this;
        },

        play: function (track) {
            this.hideSearchResults();
            this.showLoadSpinner();
            this.dodgeBeat.stream(track);
            return this;
        },

        onReady: function (callback) {
            this.hideLoadSpinner(function () {
                callback();
            });
            return this;
        },

        onStarted: function () {
            console.log('started');
            return this;
        },

        onStopped: function () {
            console.log('stopped');
            return this;
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
            this.hideSearchResults();

            if (query === '') {
                return this;
            }

            this.showLoadSpinner();
            this.searchResults = new app.SearchResultsControl('#searchContainer', {
                q: query,
                parent: this
            });
            return this;
        },

        hideSearchResults: function () {
            if (this.searchResults) {
                this.searchResults.element.empty();
                this.searchResults.destroy();
                this.searchResults = null;
            }
        },

        '#searchForm submit' : function () {
            this.search(can.$('#searchQuery').val());
            return false;
        }

     });

}(this));