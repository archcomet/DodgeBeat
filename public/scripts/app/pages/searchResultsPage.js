//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    global.app = global.app || {};

    global.app.SearchResultsPage = app.PageControl({
        defaults: {
            view: 'views/searchResults.tmpl',
            viewError: 'views/searchError.tmpl'
        }
    }, {

        init: function () {
            this.$showHideLink = can.$('#searchShowHide');
            this.$showHideLink.html('');
            app.PageControl.prototype.init.apply(this, arguments);
        },

        display: function () {
            this.$showHideLink.html('hide results');

            this.$searchResultItems = can.$(this.childNodes)
                .find('.searchResultItem')
                .removeClass('slideIn')
                .hide();

            this.slideInTime = Date.now();
            for (var i = 0, n = this.$searchResultItems.length; i < n; i++) {
                this.slideIn(this.$searchResultItems[i], i * 50, this.slideInTime);
            }

            app.PageControl.prototype.display.apply(this, arguments);
        },

        remove: function () {
            this.$showHideLink.html('show results');
            this.$searchResultItems.unbind('mouseenter mouseleave');
            app.PageControl.prototype.remove.apply(this, arguments);
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

        next: function () {
            if (this.index && this.modelList.length > this.index + 1) {
                this.parent.play(this.modelList[(++this.index)]);
                return true;
            }
            return false;
        },

        '.searchResultItem click': function (elem) {
            this.index = parseInt($(elem).attr('data-index'), 10);
            this.parent.play(this.options.model.list[this.index]);
        }
    });

}(this));