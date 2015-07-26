## Marionette.JsonForm [![Build Status](https://travis-ci.org/gkosharov/Maroinette.JsonForm.svg)](https://travis-ci.org/gkosharov/Maroinette.JsonForm)

Marionette.JsonForm is Backbone.Marionette plugin which renders an json as a form as long as each element provides the necessary meta data. The meta-data is described in the json-schema.

The whole point is that sometimes we don't know the structure of the data (the schema) in the front end but we still need to render some complex forms... Or may be it is just difficult to agree with the back-end about the names and types of data elements.

### Usage

Here is a short example of how to use the Marionette.JsonForm
```
var form = new Backbone.JsonForm({
                               "id": "PersonForm",
                               "label": "Person Form",
                               "type": "object",
                               "properties": [
                                 {
                                   "id": "GeneralDetails",
                                   "label": "General Details",
                                   "type": "object",
                                   "properties": [
                                     {
                                       "id": "name",
                                       "label": "Name",
                                       "type": "string",
                                       "value": "Smith"
                                     },
                                     {
                                       "id": "firstName",
                                       "label": "First Name",
                                       "type": "string",
                                       "value": "John"
                                     },
                                     {
                                       "id": "firstName",
                                       "label": "First Name",
                                       "type": "string",
                                       "value": "John"
                                     },
                                     {
                                        "id": "birthDate",
                                        "label": "Birth Date",
                                        "type": "date",
                                        "value": "11-11-1984",
                                        "options": {
                                            "format": "dd-mm-yyyy"
                                        }
                                     }
                                     ]
                                 }
                               ]
                             });

var formView = new Marionette.FormView({
    
    model: form
});
```
In this example the formView will use the default HTML templates provided with the package. It is possible to override those with your own.

### More complex use case is nested forms

 ```
 {
     "id": "containerForm",
     "type": "object",
     "label": "Container Form"
     "properties": [{
         "id": "nestedForm",
         "type": "object",
         "label": "Nested Form"
         "properties": [/*some properties*/]
     }]
 }
 ```
 
Marionette.JsonForm supports grid layout. The meta-data for the position of each element is in the "options" tag. E.g.

### Control layout
```
{
  "id": "PersonForm",
  "label": "Person Form",
  "type": "object",
  "options": {
    "layout": {
      "type": "grid",
      "cols": "1"
    }
  },
  "properties": [
    {
      "id": "GeneralDetails",
      "label": "General Details",
      "type": "object",
      "options": {
        "layout": {
          "type": "grid",
          "cols": "3",
          "col": 1,
          "row": 1,
          "colspan": 1
        }
      },
      "properties": [
        {
          "id": "name",
          "label": "Name",
          "type": "string",
          "value": "Smith",
          "options": {
            "layout": {
              "col": 1,
              "row": 1,
              "colspan": 1
            }
          }
        },
        {
          "id": "firstName",
          "label": "First Name",
          "type": "string",
          "value": "John",
          "options": {
            "layout": {
              "col": 2,
              "row": 1,
              "colspan": 1
            }
          }
        },
        {
          "id": "birthDate",
          "label": "Birth Date",
          "type": "date",
          "value": "11-11-1984",
          "options": {
            "layout": {
              "col": 3,
              "row": 1,
              "colspan": 1
            },
            "format": "dd-mm-yyyy"
          }
        }
      ]
    }
  ]
}
```



### Supported Form Elements

- String Input
- Integer Input
- Boolean Checkbox
- Boolean Switch-Button
- Date
- SingleSelect
- MultiSelect
- Object

### Dependencies

- Backbone.Stickit - v0.9.2
- Backbone.Validation - v0.7.1
- Marionette - v2.4.1

## Author

Georgi Kosharov