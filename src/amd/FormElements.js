/**
 * Created by g.kosharov on 26.7.2015 ã..
 */
define(['marionette', function(Marionette){
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
}]);