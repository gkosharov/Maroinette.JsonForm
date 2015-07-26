define(['jquery', 'underscore', 'require', 'marionette', 'text!config/TemplateRegister.json'], function($, _, require, Marionette, TemplateRegister){

    var TemplateManager = Marionette.TemplateManager = {
        register: JSON.parse(TemplateRegister),

        getTemplate: function(templateId, data){
            this.loadedTemplates = this.loadedTemplates || {};

            //if tempalte is already loaded
            if (this.loadedTemplates[templateId]){
                return this.loadedTemplates[templateId];
            }

            var contextPath = this._getContextPath();
            var url = _.template(this.register[templateId], {contextPath: contextPath});

            url = require.toUrl(this.register[templateId]);

            if(!url){
                console.log(templateId + "not found in the register.");
            }

            var template = this.getCompiledTemplate(url, data);

            //template caching
            this.loadedTemplates[templateId] = template;

            return template;
        },
        getTemplateFromUrl: function(url){
            var template = $.ajax({
                url     : url,
                async   : false
            }).responseText;

            return template;
        },
        getFunctionTemplate: function (templateId, data){
            var templateHTML = this.getTemplate(templateId, data);
            return _.template(templateHTML);
        },
        getCompiledTemplate: function(url, data){
            var templateHTML = this.getTemplateFromUrl(url);
            var templateFunction = _.template(templateHTML);
            var compiledTemplate = "";
            if(data) {
                compiledTemplate = templateFunction(data);
            }else{
                compiledTemplate = templateHTML;
            }
            return compiledTemplate;
        },
        _getContextPath: function(){
            return location.origin + location.pathname;
        }
    };
    return TemplateManager;

});
