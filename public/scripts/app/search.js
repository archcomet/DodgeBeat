//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    global.app = global.app || {};

    global.app.SearchResultsControl = can.Control({

        init: function (element, options) {
            this.parent = options.parent;
            app.TrackModel.search(options).then(this.onSearchResults.bind(this));
        },

        onSearchResults: function (modelList) {
            this.parent.hideLoadSpinner();
            this.modelList = modelList;
            this.displayResults();
        },

        displayResults: function () {
            this.view = can.view('views/search.tmpl', { tracks: this.modelList });

            var self = this, $searchResultItems = can.$(this.view.childNodes[0]).find('.searchResultItem');
            $searchResultItems.hide();

            setTimeout(function(){
                var i, n;
                for (i = 0, n = $searchResultItems.length; i < n; i++) {
                    self.slideIn($searchResultItems[i], i * 50);
                }
            }, 1000);

            this.element.html(this.view);
            this.on();
        },

        slideIn: function (elem, delay) {
            setTimeout(function(){
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
            var index = parseInt($(elem).attr('data-index'), 10);
            this.parent.play(this.modelList[index]);
        }

    });

}(this));