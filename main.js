var DataTypes;
(function (DataTypes) {
    DataTypes["Text"] = "text";
    DataTypes["Number"] = "number";
    DataTypes["Lookup"] = "lookup";
    DataTypes["OptionSet"] = "optionSet";
    DataTypes["DateTime"] = "dateTime";
    DataTypes["Boolean"] = "boolean";
    DataTypes["Currency"] = "currency";
    DataTypes["SingleLineOfText"] = "singleLineOfText";
    DataTypes["MultipleLinesOfText"] = "multipleLinesOfText";
    DataTypes["WholeNumber"] = "wholeNumber";
    DataTypes["FloatingPointNumber"] = "floatingPointNumber";
    DataTypes["DateOnly"] = "dateOnly";
    DataTypes["Timezone"] = "timezone";
    DataTypes["Duration"] = "duration";
    DataTypes["DecimalNumber"] = "decimalNumber";
})(DataTypes || (DataTypes = {}));
var FieldType = /** @class */ (function () {
    function FieldType(dataType, attributes) {
        this.dataType = dataType;
        this.attributes = attributes || {};
    }
    return FieldType;
}());
var Field = /** @class */ (function () {
    // additional properties
    function Field(id, name, label, required, type) {
        this.id = id;
        this.name = name;
        this.label = label;
        this.required = required;
        this.type = type;
    }
    return Field;
}());
var FieldComponent = /** @class */ (function () {
    function FieldComponent(id, field, label, fieldType, layoutId, visible, styleClass) {
        this.id = id !== null && id !== void 0 ? id : crypto.randomUUID();
        this.field = field;
        this.label = label !== null && label !== void 0 ? label : field.label;
        this.visible = visible !== null && visible !== void 0 ? visible : true;
        this.styleClass = styleClass;
        this.dataType = fieldType !== null && fieldType !== void 0 ? fieldType : field.type;
        this.layoutId = layoutId;
    }
    return FieldComponent;
}());
var LayoutComponent = /** @class */ (function () {
    function LayoutComponent(id, label, columns, visible, styleClass) {
        this.id = id !== null && id !== void 0 ? id : crypto.randomUUID();
        this.label = label;
        this.columns = columns !== null && columns !== void 0 ? columns : new Array(new Array());
        this.visible = visible !== null && visible !== void 0 ? visible : true;
        this.styleClass = styleClass;
    }
    return LayoutComponent;
}());
// Initialize form builder
var fieldsDataSample = [
    new Field("firstName", "First Name", "Enter your first name", true, new FieldType(DataTypes.SingleLineOfText, {
        maxLength: 50
    })),
    new Field("lastName", "Last Name", "Enter your last name", true, new FieldType(DataTypes.SingleLineOfText, {
        maxLength: 50
    })),
    new Field("age", "Age", "Enter your age", true, new FieldType(DataTypes.WholeNumber)),
    new Field("gender", "Gender", "Select your gender", true, new FieldType(DataTypes.OptionSet, {
        options: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" }
        ]
    })),
    new Field("birthDate", "Birth Date", "Enter your birth date", true, new FieldType(DataTypes.DateTime)),
    new Field("bio", "Bio", "Enter your bio", true, new FieldType(DataTypes.MultipleLinesOfText, {
        maxLength: 500
    })),
];
var Form = /** @class */ (function () {
    function Form(rootLayoutComponent) {
        this.rootLayoutComponent = rootLayoutComponent;
    }
    return Form;
}());
var FormBuilder = /** @class */ (function () {
    function FormBuilder(formBuilderContainer, sidebarElement, fieldsHTMLElements, form, fieldsList) {
        this.formBuilderContainer = formBuilderContainer;
        this.fieldsHTMLElements = fieldsHTMLElements !== null && fieldsHTMLElements !== void 0 ? fieldsHTMLElements : [];
        this.sidebarContainer = sidebarElement;
        this.form = form;
        this.fieldsList = fieldsList !== null && fieldsList !== void 0 ? fieldsList : [];
        this.LoadSidebarFields();
    }
    FormBuilder.prototype.LoadSidebarFields = function () {
        // Load fields from API
        // this.LoadFieldsFromApi('https://example.com/api/fields')
        //     .then((data: Array<Field>) => {
        this.fieldsList = fieldsDataSample;
        this.renderSidebar();
        // })
        // .catch(() => {
        //     // handle the error
        // });
        // Initialize event listeners
        // this.initEventListeners();
    };
    // LoadFieldsFromApi(apiUrl: string): Promise<Array<Field>> {
    //     return new Promise((resolve, reject) => {
    //             fetch(apiUrl)
    //                 .then(response => response.json())
    //                 .then(json => {
    //                     if (Array.isArray(json)) {
    //                         this.sidebarFields = json;
    //                         this.renderSidebar();
    //                         resolve(fieldsDataSample);
    //                     } else {
    //                         console.error('Invalid API response');
    //                         reject();
    //                     }
    //                 })
    //                 .catch(error => {
    //                     console.error('Error loading fields from API', error);
    //                     reject();
    //                 });
    //         resolve(fieldsDataSample);
    //     });
    // }
    FormBuilder.prototype.renderSidebar = function () {
        if (this.sidebarContainer) {
            this.sidebarContainer.innerHTML = '';
            for (var _i = 0, _a = this.fieldsList; _i < _a.length; _i++) {
                var field = _a[_i];
                var fieldElement = document.createElement('li');
                fieldElement.setAttribute('class', 'field');
                fieldElement.setAttribute('draggable', 'true');
                fieldElement.dataset.field = JSON.stringify(field);
                fieldElement.innerHTML = field.label;
                this.sidebarContainer.appendChild(fieldElement);
                this.fieldsHTMLElements.push(fieldElement);
            }
            //
            this.initFieldsEventListeners();
        }
    };
    FormBuilder.prototype.removeField = function (fieldElement) {
        var dataField = fieldElement.getAttribute('data-field');
        var field = JSON.parse(dataField);
        //remove from sidebar fields list
        this.fieldsList = this.fieldsList.filter(function (item) { return item.id != field.id; });
        // remove from sidebar html 
        this.fieldsHTMLElements = this.fieldsHTMLElements.filter(function (item) { return item != fieldElement; });
        this.sidebarContainer.removeChild(fieldElement);
    };
    FormBuilder.prototype.initFieldsEventListeners = function () {
        var _this = this;
        // Event listeners for dragging and dropping fields
        this.fieldsHTMLElements.forEach(function (el) { return el.addEventListener('dragend', function (event) {
            if (event.target instanceof HTMLElement && event.target.matches('.field')) {
                var fieldElement = event.target;
                _this.removeField(fieldElement);
            }
        }); });
        //     this.form.addEventListener('dragover', (event) => {
        //         event.preventDefault();
        //     });
        // this.form.addEventListener('drop', (event) => {
        //     event.preventDefault();
        //     if (this.draggingField) {
        //         const field = JSON.parse(this.draggingField.dataset.field || '{}') as Field;
        //         const component: Component = {
        //             dataType: 'field',
        //             field: field
        //         };
        //         const layoutElement = this.getLayoutElementAtEvent(event);
        //         if (layoutElement) {
        //             const layout = this.getComponentFromElement(layoutElement) as LayoutComponent | null;
        //             if (layout) {
        //                 layout.children.push(component);
        //                 this.renderForm();
        //             }
        //         } else {
        //             this.formLayout.push(component);
        //             this.renderForm();
        //         }
        //         this.draggingField = null;
        //     }
        // });
        //     // Event listener for adding layout
        //     this.addLayoutButton.addEventListener('click', () => {
        //         const columns = prompt('Enter number of columns for layout');
        //         if (columns) {
        //             const layout: LayoutComponent = {
        //                 dataType: 'layout',
        //                 name: 'Layout',
        //                 label: 'Layout',
        //                 columns: parseInt(columns),
        //                 children: []
        //             };
        //             this.formLayout.push(layout);
        //             this.renderForm();
        //         }
        //     });
        //     // Event listener for exporting form
        //     this.exportFormButton.addEventListener('click', () => {
        //         const form = JSON.stringify(this.formLayout);
        //         console.log(form);
        //     });
        //     // Event listener for viewing form
        //     this.viewFormButton.addEventListener('click', () => {
        //         const form = JSON.stringify(this.formLayout);
        //         const formViewer = window.open('', 'Form Viewer');
        //         if (formViewer) {
        //             formViewer.document.write(`<pre>${form}</pre>`);
        //         }
        //     });
        // }
        // private getComponentFromElement(element: HTMLElement): Component | null {
        //     if (element.dataset.component) {
        //         const component = JSON.parse(element.dataset.component) as Component;
        //         return component;
        //     }
        //     return null;
        // }
        // private getLayoutElementAtEvent(event: DragEvent, element: HTMLElement = event.target as HTMLElement): HTMLElement | null {
        //     if (element.matches('.layout')) {
        //         return element;
        //     } else if (element.parentElement) {
        //         return this.getLayoutElementAtEvent(event, element.parentElement);
        //     }
        //     return null;
        // }
        // private renderForm() {
        //     this.form.innerHTML = '';
        //     for (const component of this.formLayout) {
        //         const componentElement = this.createComponentElement(component);
        //         this.form.appendChild(componentElement);
        //     }
        // }
        // private createComponentElement(component: Component): HTMLElement {
        //     if (component.dataType === 'field') {
        //         const field = component.field!;
        //         const fieldElement = document.createElement('div');
        //         fieldElement.setAttribute('class', 'field');
        //         fieldElement.setAttribute('data-component', JSON.stringify(component));
        //         fieldElement.innerHTML = `<label>${field.label} </label><input type="${field.dataType.type}" required="${field.required}">`;
        //         return fieldElement;
        //     } else if (component.dataType === 'layout') {
        //         const layout = component.layout!;
        //         const layoutElement = document.createElement('div');
        //         layoutElement.setAttribute('class', 'layout');
        //         layoutElement.setAttribute('data-component', JSON.stringify(component));
        //         layoutElement.style.gridTemplateColumns = `repeat(${layout.columns}, 1fr)`;
        //         for (const child of layout.children) {
        //             const childElement = this.createComponentElement(child);
        //             layoutElement.appendChild(childElement);
        //         }
        //         return layoutElement;
        //     }
        //     throw new Error(`Invalid component type: ${component.dataType}`);
        // }
    };
    return FormBuilder;
}());
var formBuilderContainer = document.getElementById('mainContainer');
// const sidebarContainer = document.getElementById('sidebar-container')!;
// const addLayoutButton = document.getElementById('add-layout-button')!;
// const exportFormButton = document.getElementById('export-form-button')!;
// const viewFormButton = document.getElementById('view-form-button')!;
var formBuilder = new FormBuilder(formBuilderContainer, formBuilderContainer.querySelector('#sidebar'));
