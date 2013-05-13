//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    global.app = global.app || {};

    global.app.SearchResultsControl = can.Control({

        init: function (element, options) {
            this.parent = options.parent;
            this.query = options.q;
            app.TrackModel.search(options).then(this.onSearchResults.bind(this));
        },

        next: function () {
            if (this.index && this.modelList.length > this.index + 1) {
                this.parent.play(this.modelList[(++this.index)]);
                return true;
            }
            return false;
        },

        onSearchResults: function (modelList) {
            var self = this;
            this.modelList = modelList;
            this.parent.onSearchResultsFound(function () {
                if (self.modelList.length > 0) {
                    self.displayResults();
                } else {
                    self.displayNoneFound();
                }
            });

        },

        displayNoneFound: function () {
            this.view = can.view('views/searchNoneFound.tmpl', { query: this.query });
            this.element.hide().html(this.view).fadeIn();
        },

        displayResults: function () {
            this.view = can.view('views/searchResults.tmpl', { tracks: this.modelList });
            this.$searchResultItems = can.$(this.view.childNodes[0]).find('.searchResultItem');
            this.showResults();
            this.element.html(this.view);
            this.on();
        },

        showResults: function () {
            this.slideInTime = Date.now();
            this.$searchResultItems.removeClass('slideIn');
            this.$searchResultItems.hide();
            for (var i = 0, n = this.$searchResultItems.length; i < n; i++) {
                this.slideIn(this.$searchResultItems[i], i * 50, this.slideInTime);
            }
        },

        slideIn: function (elem, delay, slideInTime) {
            var self = this;
            setTimeout(function () {
                if (self.slideInTime !== slideInTime) {
                    return;
                }
                can.$(elem)
                    .addClass('slideIn')
                    .show()
                    .hover(function() {
                        can.$(this).addClass('hover');
                    }, function() {
                        can.$(this).removeClass('hover');
                    });
            }, delay);
        },

        '.searchResultItem click': function (elem) {
            this.index = parseInt($(elem).attr('data-index'), 10);
            this.parent.play(this.modelList[this.index]);
        }

    });

}(this));