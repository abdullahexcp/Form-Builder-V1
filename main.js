"use strict";
exports.__esModule = true;
var es6_promise_1 = require("es6-promise");
var FormBuilder = /** @class */ (function () {
    function FormBuilder(formContainer, sidebarContainer, addLayoutButton, exportFormButton, viewFormButton) {
        this.draggingField = null;
        this.dragStartOffsetX = 0;
        this.dragStartOffsetY = 0;
        this.formContainer = formContainer;
        this.sidebarContainer = sidebarContainer;
        this.addLayoutButton = addLayoutButton;
        this.exportFormButton = exportFormButton;
        this.viewFormButton = viewFormButton;
        this.formLayout = [];
        this.sidebarFields = [];
        // Load fields from API
        this.loadFieldsFromApi('https://example.com/api/fields')
            .then(function () {
            // do something after the API call is successful
        })["catch"](function () {
            // handle the error
        });
        // Initialize event listeners
        this.initEventListeners();
        // Render initial state
        this.renderSidebar();
    }
    FormBuilder.prototype.loadFieldsFromApi = function (apiUrl) {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve, reject) {
            fetch(apiUrl)
                .then(function (response) { return response.json(); })
                .then(function (json) {
                if (Array.isArray(json)) {
                    _this.sidebarFields = json;
                    _this.renderSidebar();
                    resolve("");
                }
                else {
                    console.error('Invalid API response');
                    reject();
                }
            })["catch"](function (error) {
                console.error('Error loading fields from API', error);
                reject();
            });
        });
    };
    FormBuilder.prototype.renderSidebar = function () {
        var sidebar = this.sidebarContainer.querySelector('#sidebar');
        if (sidebar) {
            sidebar.innerHTML = '';
            for (var _i = 0, _a = this.sidebarFields; _i < _a.length; _i++) {
                var field = _a[_i];
                var fieldElement = document.createElement('li');
                fieldElement.setAttribute('class', 'field');
                fieldElement.setAttribute('draggable', 'true');
                fieldElement.dataset.field = JSON.stringify(field);
                fieldElement.innerHTML = field.label;
                sidebar.appendChild(fieldElement);
            }
        }
    };
    FormBuilder.prototype.initEventListeners = function () {
        var _this = this;
        // Event listeners for dragging and dropping fields
        this.sidebarContainer.addEventListener('dragstart', function (event) {
            if (event.target instanceof HTMLElement && event.target.matches('.field')) {
                _this.draggingField = event.target;
                _this.dragStartOffsetX = event.offsetX;
                _this.dragStartOffsetY = event.offsetY;
            }
        });
        this.formContainer.addEventListener('dragover', function (event) {
            event.preventDefault();
        });
        this.formContainer.addEventListener('drop', function (event) {
            event.preventDefault();
            if (_this.draggingField) {
                var field = JSON.parse(_this.draggingField.dataset.field || '{}');
                var component = {
                    type: 'field',
                    field: field
                };
                var layoutElement = _this.getLayoutElementAtEvent(event);
                if (layoutElement) {
                    var layout = _this.getComponentFromElement(layoutElement);
                    if (layout) {
                        layout.children.push(component);
                        _this.renderForm();
                    }
                }
                else {
                    _this.formLayout.push(component);
                    _this.renderForm();
                }
                _this.draggingField = null;
            }
        });
        // Event listener for adding layout
        this.addLayoutButton.addEventListener('click', function () {
            var columns = prompt('Enter number of columns for layout');
            if (columns) {
                var layout = {
                    type: 'layout',
                    name: 'Layout',
                    label: 'Layout',
                    columns: parseInt(columns),
                    children: []
                };
                _this.formLayout.push(layout);
                _this.renderForm();
            }
        });
        // Event listener for exporting form
        this.exportFormButton.addEventListener('click', function () {
            var form = JSON.stringify(_this.formLayout);
            console.log(form);
        });
        // Event listener for viewing form
        this.viewFormButton.addEventListener('click', function () {
            var form = JSON.stringify(_this.formLayout);
            var formViewer = window.open('', 'Form Viewer');
            if (formViewer) {
                formViewer.document.write("<pre>".concat(form, "</pre>"));
            }
        });
    };
    FormBuilder.prototype.getComponentFromElement = function (element) {
        if (element.dataset.component) {
            var component = JSON.parse(element.dataset.component);
            return component;
        }
        return null;
    };
    FormBuilder.prototype.getLayoutElementAtEvent = function (event, element) {
        if (element === void 0) { element = event.target; }
        if (element.matches('.layout')) {
            return element;
        }
        else if (element.parentElement) {
            return this.getLayoutElementAtEvent(event, element.parentElement);
        }
        return null;
    };
    FormBuilder.prototype.renderForm = function () {
        this.formContainer.innerHTML = '';
        for (var _i = 0, _a = this.formLayout; _i < _a.length; _i++) {
            var component = _a[_i];
            var componentElement = this.createComponentElement(component);
            this.formContainer.appendChild(componentElement);
        }
    };
    FormBuilder.prototype.createComponentElement = function (component) {
        if (component.type === 'field') {
            var field = component.field;
            var fieldElement = document.createElement('div');
            fieldElement.setAttribute('class', 'field');
            fieldElement.setAttribute('data-component', JSON.stringify(component));
            fieldElement.innerHTML = "<label>".concat(field.label, " </label><input type=\"").concat(field.dataType.type, "\" required=\"").concat(field.required, "\">");
            return fieldElement;
        }
        else if (component.type === 'layout') {
            var layout = component.layout;
            var layoutElement = document.createElement('div');
            layoutElement.setAttribute('class', 'layout');
            layoutElement.setAttribute('data-component', JSON.stringify(component));
            layoutElement.style.gridTemplateColumns = "repeat(".concat(layout.columns, ", 1fr)");
            for (var _i = 0, _a = layout.children; _i < _a.length; _i++) {
                var child = _a[_i];
                var childElement = this.createComponentElement(child);
                layoutElement.appendChild(childElement);
            }
            return layoutElement;
        }
        throw new Error("Invalid component type: ".concat(component.type));
    };
    return FormBuilder;
}());
// Initialize form builder
var formContainer = document.getElementById('form-container');
var sidebarContainer = document.getElementById('sidebar-container');
var addLayoutButton = document.getElementById('add-layout-button');
var exportFormButton = document.getElementById('export-form-button');
var viewFormButton = document.getElementById('view-form-button');
var formBuilder = new FormBuilder(formContainer, sidebarContainer, addLayoutButton, exportFormButton, viewFormButton);
