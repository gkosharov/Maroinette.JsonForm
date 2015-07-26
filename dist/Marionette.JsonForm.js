/**
 * Created by g.kosharov on 16.5.2015 г..
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'underscore', 'backbone', 'marionette', 'backbone.relational', 'backbone.stickit', 'backbone.validation'], factory);
    } else if (typeof exports !== 'undefined') {
        var Backbone = require('backbone');
        var _ = require('underscore');
        var $ = require('jquery');
        require('backbone.relational');
        require('backbone.stickit');
        require('backbone.validation');
        module.exports = factory(root, $, _, Backbone, Marionette);
    } else {
        // Browser globals
        root.Marionette.FormView = factory(root.jQuery, root._, root.Backbone, root.Marionette, root.Backbone.Relational, root.Backbone.Stickit, root.Backbone.Validation);
    }
}(this, function ($, _, Backbone, Marionette) {
    "use strict";

    var FormModel = Backbone.JsonForm = Backbone.RelationalModel.extend({
        relations: [{
            type: Backbone.HasMany,
            key: 'properties',
            relatedModel: FormModel,
            reverseRelation: {
                key: 'parent',
                includeInJSON: 'id'
            }
        }]
    });

    Marionette.FormElements = (function (_) {
        function FormElements(view, formElements) {

            if (!_.isObject(view.formElements)) {
                return {};
            }

            // FormElements defined on a view can be a flat object literal
            // or it can be a function that returns an object.
            formElements = FormElements.parseFormElements(view, formElements || _.result(view, 'formElements'));

            return formElements;
        }

        _.extend(FormElements, {
            // Placeholder method to be extended by the user.
            // The method should define the object that stores the formElements.
            // i.e.
            //
            // ```js
            // Marionette.FormElements.formElementsLookup: function() {
            //   return App.FormElements
            // }
            // ```
            formElementsLookup: function () {
                throw new Marionette.Error({
                    message: 'You must define where your formElements are stored.',
                    url: 'marionette.formElements.html#formElementslookup'
                });
            },

            // Takes care of getting the formElement class
            // given options and a key.
            // If a user passes in options.formElementClass
            // default to using that. Otherwise delegate
            // the lookup to the users `formElementsLookup` implementation.
            getFormElementClass: function (options, key) {
                if (options.formElementClass) {
                    return options.formElementClass;
                }

                // Get formElement class can be either a flat object or a method
                return Marionette._getValue(FormElements.formElementsLookup, this, [options, key])[key];
            },

            // Iterate over the formElements object, for each formElement
            // instantiate it and get its grouped formElements.
            parseFormElements: function (view, formElements) {
                return _.chain(formElements).map(function (options, key) {
                    var FormElementClass = FormElements.getFormElementClass(options, key);

                    var formElement = new FormElementClass(options, view);
                    var nestedFormElements = FormElements.parseFormElements(view, _.result(formElement, 'formElements'));

                    return [formElement].concat(nestedFormElements);
                }).flatten().value();
            }
        });

        return FormElements;
    })(_);

    var JsonFormElementView = Marionette.JsonFormElementView = Marionette.ItemView.extend({});
    /**
     * A module representing the JsonForm
     * @exports FormView
     * @class FormView
     * @constructor
     * @augments Marionette.CompositeView
     * @classdesc A Marionette view for rendering a form by a given json
     */
    var JsonFormView = Marionette.JsonFormView = Marionette.CompositeView.extend({
        /**
         *
         * @property  {Object} ui
         * @desc pointers to the ui-element of the submit action
         */
        ui: {
            "submit": ".btn-submit"
        },
        /**
         *
         * @property  {Object} triggers
         * @desc marionette trigger of the submit action
         */
        events: {
            "click @ui.submit": "Submit"
        },
        childViewContainer: ".form-content",
        /**
         * @property {Object} bindings
         * @desc used by stickit to manage codeless two-way model-view binding
         */
        bindings: {},

        formElements: {
            "string": {},
            "number": {},
            "date": {},
            "object": {}
        },

        /**
         * @public
         * @param options
         * @desc setup model-view bindings and validation; Since the form has recursive structure - setup parent-child relationship between forms
         */
        initialize: function (options) {
            if (options.template) {
                this.template = Marionette.TemplateManager.getFunctionTemplate("form");
            }

            if (!this.model || !(this.model instanceof Backbone.JsonForm)) {
                throw new Error("No valid model provided!");
            }

            if (!options.collection && !this.collection && this.model.get("properties")) {
                this.collection = this.model.get("properties");
            }
            if (options.submittable) {
                this.model.set({"submittable": true});
            }
        },

        /**
         * @public
         * @desc handles the 'show' event
         */
        onShow: function () {
            this._setupLayout();
            this._applyLayout();
            this._setupBindings(this.options);
            this._setupValidation(this.options);
            if(Backbone.Validation)
                Backbone.Validation.bind(this);

        },
        /**
         * @public
         * @param child
         * @param ChildViewClass
         * @param childViewOptions
         * @returns {ChildViewClass}
         */
        buildChildView: function (child, ChildViewClass, childViewOptions) {
            var options = childViewOptions;
            // build the final list of options for the childView class
            var size = this._getElementSize(child);
            var viewType = this._getElementType(child);
            var template = viewType ? Marionette.TemplateManager.getFunctionTemplate(viewType) : Marionette.TemplateManager.getFunctionTemplate(child.get("type"));

            switch (viewType) {

                case "object":
                    var formTemplate = this.model.get("firstLevel") ? "form" : "innerform";
                    options = _.extend({
                        tagName: "div",
                        className: child.get("id") + " col-lg-" + size,
                        model: child,
                        collection: child.get("properties"),
                        childViewContainer: ".form-content",
                        template: Marionette.TemplateManager.getFunctionTemplate(formTemplate)
                    });
                    break;
                case "tree":
                    options = _.extend({
                        tagName: "ul",
                        className: child.get("id") + " col-lg-" + size + " tree-view-root",
                        model: child,
                        collection: child.get("properties"),
                        childViewContainer: ".form-content",
                        template: Marionette.TemplateManager.getFunctionTemplate("tree")
                    });
                    break;
                case "select":

                    options = _.extend({
                        tagName: "div",
                        className: child.get("id") + " form-element col-lg-" + size,
                        model: child,
                        collection: child.get("properties"),
                        childViewContainer: ".form-content",
                        template: Marionette.TemplateManager.getFunctionTemplate('select')
                    });
                    break;

                default:

                    options = _.extend({
                        tagName: "div",
                        className: child.get("id") + " form-element col-lg-" + size,
                        model: child,
                        template: template,
                        childViewContainer: ".form-content"
                    }, childViewOptions);
            }
            var view = new ChildViewClass(options);

            return view;
        },
        /**
         * @public
         * @param model
         * @returns {*}
         */
        getChildView: function (model) {
            var type = this._getElementType(model);
            console.log("creating child " + type);
            var options = this.formElements[type] || {};

            return Marionette.FormElements.getFormElementClass(options, type);
        },
        /**
         * @public
         */
        onRenderTemplate: function () {
            if (this.model.get("isEmpty")) {
                this.$(".sub-panel").addClass("empty-sub-panel");
            }
        },
        /**
         *
         * @param model
         * @returns {*}
         * @private
         */
        _getElementType: function (model) {
            var type = model.get("type");
            if (!type) {
                throw new Error("Undefined type for element " + model.get("id"));
            }
            return type;
        },
        /**
         *
         * @returns {*}
         * @private
         */
        _getColsCount: function () {
            var options = this.model.get("options") && this.model.get("options").layout ? this.model.get("options").layout : undefined;
            var cols = options && options.cols ? options.cols : 1;
            return cols;
        },
        /**
         *
         * @param element
         * @returns {number}
         * @private
         */
        _getElementSize: function (element) {
            var cols = this._getColsCount();
            var opts = element.get("options") && element.get("options").layout ? element.get("options").layout : undefined;
            var colspan = opts && opts.colspan ? opts.colspan : 1;
            var singleElementSize = 12 / cols;
            var result = colspan * singleElementSize <= 12 ? colspan * singleElementSize : 12;
            return result;
        },
        /**
         * @desc Updates directly the DOM in order to honor the layout config
         * @private
         */
        _applyLayout: function () {
            var options = this.model.get("options") && this.model.get("options").layout ? this.model.get("options").layout : undefined;
            var cols = options && options.cols ? options.cols : 1;
            if (this.collection && this.collection.length) {
                try {

                    this.collection.each(_.bind(function (model, index) {
                        var options = model.get("options");
                        var col = options.col || null;
                        var row = options.row || "last";
                        var $element = this.$("." + model.get("id"));
                        var $row = this.$('[data-row="' + row + '"]>.col-lg-12') ? this.$('[data-row="' + row + '"]>.col-lg-12') : this.$("#" + this.model.get("id") + "_content");

                        $row.append($element);
                        /* order the elements on the row in the desired order. May be better to add col container*/
                        /*var r = $row.find(".form-element").sort(function (a, b) {
                         return parseInt($(b).data("col")) - parseInt($(a).data("col"));
                         });
                         $row.empty().append(r);*/
                    }, this));


                } catch (e) {

                }
            }
        },
        /**
         * @desc setups grid layout by adding container rows where all form elements will be distributed
         * @private
         */
        _setupLayout: function () {
            try {
                var length = this.collection instanceof Backbone.Collection ? this.collection.length : 0;
                for (var i = 1; i < length + 1; i++) {
                    this.$("#" + this.model.get("id") + "_content").append("<div class='row' data-row='" + i + "'><div class='col-lg-12'></div><div></div>");
                }
                this.$("#" + this.model.get("id") + "_content").append("<div class='row' data-row='last'><div class='col-lg-12'></div><div></div>");
            } catch (e) {
                console.log(this.model.get("id") + ": Building layout failed with " + e.message);
            }
        },
        /**
         * @desc manage stickit bindings
         * @param options
         * @private
         */
        _setupBindings: function (options) {
            if (this.collection && this.collection.length) {
                this.collection.each(_.bind(function (item) {
                    var id = item.get("id");
                    var type = this._getElementType(item);
                    var prop = id;

                    switch (type) {
                        case "object":
                            break;
                        case "decimal":
                            var formatFn = this._formatDecimal;
                            this.addBinding(this.model, "#" + prop, {
                                observe: id,

                                onGet: function (val, options) {
                                    return formatFn(val);
                                }

                            });
                            break;
                        case "integer":
                            var formatFn = this._formatNumber;
                            this.addBinding(this.model, "#" + prop, {
                                observe: id,

                                onGet: function (val, options) {
                                    return formatFn(val);
                                }

                            });
                            break;
                        case "date":
                            var formatFn = this._formatDate;
                            this.addBinding(this.model, "#" + prop, {
                                observe: id,
                                selectOptions: {
                                    validate: true
                                },
                                onGet: function (val, options) {
                                    if (val && val !== "") {
                                        var result = formatFn(val, {
                                            type: "date",
                                            inbound: "yyyy-mm-dd",
                                            outbound: "dd/mm/yyyy"
                                        });
                                        return result;
                                    } else {
                                        return "";
                                    }
                                },
                                onSet: function (val, options) {
                                    var newValue;
                                    if (val && val !== "") {
                                        newValue = formatFn(val, {
                                            type: "date",
                                            inbound: "dd/mm/yyyy",
                                            outbound: "yyyy-mm-dd"
                                        });
                                    } else {
                                        newValue = "";
                                    }

                                    try {
                                        console.log("set " + newValue);
                                        var target = options.observe;
                                        var model = options.view.model;

                                        var properties = model.get("properties");
                                        if (properties) {
                                            var targetModel = properties.findWhere({"id": target});
                                            targetModel.set({"value": newValue});
                                        }
                                    } catch (e) {
                                        console.log("failed to set " + options.observe);
                                    }
                                    return newValue;
                                }
                            });
                            break;
                        case "select":
                            prop = "select#" + id;
                            var dataSource = item.get("dataSource");
                            var collection = [];
                            if (dataSource) {
                                for (var attribute in dataSource.attributes) {
                                    collection.push({label: dataSource.get(attribute), value: attribute});
                                }
                            }

                            this.addBinding(this.model, prop, {
                                observe: id,
                                selectOptions: {
                                    defaultOption: {
                                        label: "",
                                        value: null
                                    },
                                    validate: true,
                                    collection: collection
                                },

                                onSet: function (val, options) {
                                    try {
                                        console.log("set " + val);
                                        var target = options.observe;
                                        var model = options.view.model;
                                        /* propagate value of the select to the DOM in order to be used by the preview pane (Mnoo zle!) */
                                        options.view.$("select#" + target).attr("data-val", val);
                                        var properties = model.get("properties");
                                        if (properties) {
                                            var targetModel = properties.findWhere({"id": target});
                                            targetModel.set({"value": val});
                                        }
                                    } catch (e) {
                                        console.log("failed to set " + options.observe);
                                    }
                                    return val;
                                }
                            });
                            break;
                        case "boolean":
                            prop = "#" + id;
                            this.addBinding(this.model, prop, {
                                observe: id,
                                selectOptions: {
                                    validate: true
                                },
                                onSet: function (val, options) {
                                    try {
                                        console.log("set " + val);
                                        var target = options.observe;
                                        var model = options.view.model;

                                        var properties = model.get("properties");
                                        if (properties) {
                                            var targetModel = properties.findWhere({"id": target});
                                            targetModel.set({"value": val});
                                        }
                                    } catch (e) {
                                        console.log("failed to set " + options.observe);
                                    }
                                    return val;
                                }
                            });
                            break;
                        default:
                            prop = "#" + id;
                            this.addBinding(this.model, prop, {
                                observe: id,
                                setOptions: {
                                    validate: true
                                },
                                onSet: function (val, options) {
                                    try {
                                        console.log("set " + val);
                                        var target = options.observe;
                                        var model = options.view.model;
                                        var properties = model.get("properties");
                                        if (properties) {
                                            var targetModel = properties.findWhere({"id": target});
                                            targetModel.set({"value": val});
                                        }
                                    } catch (e) {
                                        console.log("failed to set " + options.observe);
                                    }
                                    return val;
                                }
                            });
                    }
                }, this));
                this.stickit();
            }

        },
        _formatDate: function (val, options) {
            return Backbone.Radio.channel("global").request("format:date", val, options);
        },
        _formatDecimal: function (val) {
            return Backbone.Radio.channel("global").request("format:decimal", val);
        },
        _formatNumber: function (val) {
            return Backbone.Radio.channel("global").request("format:number", val);
        },
        /**
         * @desc manage Backbone.Validation
         * @private
         */
        _setupValidation: function () {
            if (this.collection && this.collection.length) {
                this.collection.each(_.bind(function (item) {
                    var id = item.get("id");
                    var type = item.get("type");
                    var required = item.get("required") || false;
                    var options = item.get("options") || {};

                    var prop = id;
                    if (!this.model.validation) this.model.validation = {};
                    this.model.validation[id] = {};
                    switch (type) {
                        case "object":
                            break;
                        default :
                            var validation = {required: required};
                            this.model.validation[id] = validation;

                            break;
                    }
                }, this));
            }
        },
        /**
         * @public
         * @desc Remove the validation and the model-view bindings
         */

        remove: function () {
            this.unstickit();
            try {
                Backbone.Validation.unbind(this);
            } catch (exception) {
                console.log("Backbone Validation unbind failed for " + this.model.get("id"));
            }
        }
    });
}));