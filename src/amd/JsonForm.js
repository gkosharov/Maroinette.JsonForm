/**
 * Created by g.kosharov on 26.7.2015 ã..
 */
define(['marionette'], function(Marionette){
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
    return FormModel;
});