//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    global.app = global.app || {};

    global.app.pageManager = (function() {
        var parent = null,
            currentPage = null,
            cachedPages = {};

        return {

            setParent: function (parentControl) {
                parent = parentControl;
            },

            display: function (controlName, options) {
                if (currentPage) {
                    app.pageManager.remove(function() {
                        app.pageManager.display(controlName, options);
                    });
                    return;
                }

                currentPage = cachedPages[controlName];
                if (currentPage) {
                    currentPage.update(options);
                } else {
                    currentPage = new app[controlName](parent, options);
                    cachedPages[controlName] = currentPage;
                }
            },

            remove: function (callback) {
                if (currentPage) {
                    currentPage.remove(callback);
                    currentPage = null;
                }
            }

        };
    }());

    global.app.PageControl = can.Control({
        defaults: {
            model: {}
        }
    },{
        setup: function (parent, options) {
            this.parent = parent;
            return can.Control.prototype.setup.call(this, parent.$pageContainer, options);
        },

        init: function () {
            var defer = this.options.model.then;
            if (defer && defer.bind === Function.prototype.bind) {
                this.renderDeferred();
            } else {
                this.render();
            }
        },

        renderDeferred: function () {
            this.parent.showLoadSpinner();
            this.options.model.then(
                this.onDeferSuccess.bind(this),
                this.onDeferError.bind(this)
            );
        },

        render: function (view) {
            view = view || this.options.view;
            var i, n, fragment = can.view(view, this.options.model);
            this.childNodes = [];
            for (i = 0, n = fragment.childNodes.length; i < n; i++) {
                this.childNodes.push(fragment.childNodes[i]);
            }

            this.display();
        },

        display: function (callback) {
            var i, n, fragment = document.createDocumentFragment();
            for (i = 0, n = this.childNodes.length; i < n; i++) {
                fragment.appendChild(this.childNodes[i]);
            }

            this.element.hide().html(fragment).fadeIn(callback);
            this.on();
        },

        update: function (options) {
            var key;
            for (key in options) {
                if (options.hasOwnProperty(key)) {
                    this.options[key] = options[key];
                }
            }
            this.refresh();
        },

        refresh: function () {
            var defer = this.options.model.then;
            if (defer && defer.bind === Function.prototype.bind) {
                this.renderDeferred();
            } else {
                this.display();
            }
        },

        remove: function (callback) {
            this.element.fadeOut(function(){
                if (callback) {
                    callback();
                }
            });
        },

        onDeferSuccess: function (model) {
            var self = this;
            this.options.model = (model instanceof can.Model.List) ? { list: model } : model;
            this.parent.hideLoadSpinner(function(){
                self.render();
            });
        },

        onDeferError: function (err) {
            var self = this;
            this.options.model.error = err;
            this.parent.hideLoadSpinner(function() {
                self.render(self.options.viewError);
            });
        }
    });

}(this));