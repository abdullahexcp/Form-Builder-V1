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
    function FieldComponent(id, field, label, fieldType, layoutColumnId, elementRef, styleClass, visible) {
        this.id = id !== null && id !== void 0 ? id : crypto.randomUUID();
        this.field = field;
        this.label = label !== null && label !== void 0 ? label : field.label;
        this.visible = visible !== null && visible !== void 0 ? visible : true;
        this.styleClass = styleClass !== null && styleClass !== void 0 ? styleClass : "field-component";
        this.dataType = fieldType !== null && fieldType !== void 0 ? fieldType : field.type;
        this.layoutColumnId = layoutColumnId;
        this.elementRef = elementRef;
    }
    return FieldComponent;
}());
var LayoutComponent = /** @class */ (function () {
    function LayoutComponent(id, label, columns, elementRef, styleClass, visible) {
        this.id = id !== null && id !== void 0 ? id : crypto.randomUUID();
        this.label = label;
        this.visible = visible !== null && visible !== void 0 ? visible : true;
        this.styleClass = styleClass !== null && styleClass !== void 0 ? styleClass : "layout-component";
        this.elementRef = elementRef;
        this.columns = columns !== null && columns !== void 0 ? columns : new Array();
    }
    return LayoutComponent;
}());
var LayoutColumnComponent = /** @class */ (function () {
    function LayoutColumnComponent(id, parentLayoutId, label, elementRef, styleClass, visible) {
        this.id = id !== null && id !== void 0 ? id : crypto.randomUUID();
        this.label = label;
        this.visible = visible !== null && visible !== void 0 ? visible : true;
        this.styleClass = styleClass !== null && styleClass !== void 0 ? styleClass : "layout-column-component";
        this.parentLayoutId = parentLayoutId;
        this.elementRef = elementRef;
    }
    return LayoutColumnComponent;
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
    Form.prototype.insertFieldIntoLayoutColumn = function (fieldElement, parentColumnElement) {
        var dataField = fieldElement.getAttribute('data-field');
        var field = JSON.parse(dataField);
        var dataLayoutColumn = parentColumnElement.getAttribute('data-col');
        var layoutColumn = JSON.parse(dataLayoutColumn);
        //insert field visually
        var listItemElement = document.createElement("li");
        listItemElement.draggable = true;
        // TODO : li event listner on drag
        var label = document.createElement("label");
        label.innerText = field === null || field === void 0 ? void 0 : field.name;
        var input = document.createElement("input");
        input.disabled = true;
        input.type = "text";
        input.placeholder = field.name;
        listItemElement.appendChild(label);
        listItemElement.appendChild(input);
        // Append the list item to the unordered list
        parentColumnElement.appendChild(listItemElement);
        //#insert into form tree
        // create the field componenet 
        var fieldComponenet = new FieldComponent(field.id, field, field.name, field.type, layoutColumn.id, listItemElement);
        //set fieldcomponenet as dataset json in li htmlelement
        listItemElement.dataset.fieldComponent = JSON.stringify(fieldComponenet);
        var nestedLayoutCompnent = this.getComponentById(layoutColumn.id);
        nestedLayoutCompnent.childrenComponents.push(fieldComponenet);
    };
    Form.prototype.getComponentById = function (id, component) {
        if (component === void 0) { component = this.rootLayoutComponent; }
        if (component.id === id) {
            return component;
        }
        if (component instanceof LayoutComponent) {
            for (var _i = 0, _a = component.columns; _i < _a.length; _i++) {
                var column = _a[_i];
                var result = this.getComponentById(id, column);
                if (result) {
                    return result;
                }
            }
        }
        if (component instanceof LayoutColumnComponent) {
            for (var _b = 0, _c = component.childrenComponents || []; _b < _c.length; _b++) {
                var child = _c[_b];
                var result = this.getComponentById(id, child);
                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    };
    Form.prototype.getNestedHTMLElementsListOfColumnsORFieldsComponents = function (columnsComponent, elementsList) {
        if (columnsComponent === void 0) { columnsComponent = this.rootLayoutComponent.columns; }
        if (elementsList === void 0) { elementsList = []; }
        for (var _i = 0, columnsComponent_1 = columnsComponent; _i < columnsComponent_1.length; _i++) {
            var columnComponent = columnsComponent_1[_i];
            elementsList.push(columnComponent.elementRef);
            for (var _a = 0, _b = columnComponent.childrenComponents; _a < _b.length; _a++) {
                var childComponent = _b[_a];
                if (childComponent instanceof LayoutComponent) {
                    elementsList = this.getNestedHTMLElementsListOfColumnsORFieldsComponents(childComponent.columns, elementsList);
                }
                else if (childComponent instanceof FieldComponent) {
                    elementsList.push(childComponent.elementRef);
                }
            }
        }
        return elementsList;
    };
    return Form;
}());
var FormBuilder = /** @class */ (function () {
    function FormBuilder(formBuilderContainer, sidebarElement, fieldsHTMLElements, form, fieldsList) {
        this.formBuilderContainer = formBuilderContainer;
        this.fieldsHTMLElements = fieldsHTMLElements !== null && fieldsHTMLElements !== void 0 ? fieldsHTMLElements : [];
        this.sidebarContainer = sidebarElement;
        this.form = form !== null && form !== void 0 ? form : new Form();
        this.fieldsList = fieldsList !== null && fieldsList !== void 0 ? fieldsList : [];
        this.initAndRenderRootLayoutComponent();
        this.LoadSidebarFields();
    }
    FormBuilder.prototype.initAndRenderRootLayoutComponent = function () {
        //create column component and html element -- with its data
        var columnComponent = new LayoutColumnComponent();
        var columnHtmlElement = document.createElement('div');
        columnHtmlElement.classList.add('layout-column-component');
        columnComponent.elementRef = columnHtmlElement;
        //create root layout component and html elemnt -- with its data
        var rootLayoutComponent = new LayoutComponent();
        var rootLayoutHtmlElement = document.createElement('div');
        rootLayoutHtmlElement.classList.add('layout-component');
        rootLayoutComponent.elementRef = rootLayoutHtmlElement;
        //bind column to layout comonent and html element
        rootLayoutComponent.columns.push(columnComponent);
        rootLayoutHtmlElement.appendChild(columnHtmlElement);
        columnComponent.parentLayoutId = rootLayoutComponent.id;
        this.form.rootLayoutComponent = rootLayoutComponent;
        // bind dataset on html elements
        columnHtmlElement.dataset.component = JSON.stringify(columnComponent);
        rootLayoutHtmlElement.dataset.component = JSON.stringify(rootLayoutComponent);
        //insert the layout component and html element into container and set html to rootlayout
        this.formBuilderContainer.appendChild(rootLayoutHtmlElement);
    };
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
        this.fieldsHTMLElements.forEach(function (fieldElement) {
            // read the id from the dataset  and get the component
            // el.addEventListener('dragend', (event) => {
            //     if (event.target instanceof HTMLElement && event.target.matches('.field')) {
            //         const fieldElement = event.target;
            //         this.removeField(fieldElement);
            //     }
            // });
            // insert componenet on drop
            fieldElement.addEventListener('drop', function (event) {
                event.preventDefault();
                // get the event element 
                var targetElement = event.target;
                //insert field into component layout column
                var parentColumnElement = targetElement.closest('.layout-column-component');
                targetElement.classList.remove('dragover');
                _this.form.insertFieldIntoLayoutColumn(fieldElement, parentColumnElement);
                _this.removeField(fieldElement);
            });
        });
        var allNestedElements = this.form.getNestedHTMLElementsListOfColumnsORFieldsComponents();
        allNestedElements.forEach(function (el) {
            // darg over highlight the form componenets
            el.addEventListener('dragover', function (event) {
                event.preventDefault();
                var targetElement = event.target;
                targetElement.classList.add('dragover');
            });
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
        });
    };
    return FormBuilder;
}());
var formBuilderContainer = document.getElementById('mainContainer');
// const sidebarContainer = document.getElementById('sidebar-container')!;
// const addLayoutButton = document.getElementById('add-layout-button')!;
// const exportFormButton = document.getElementById('export-form-button')!;
// const viewFormButton = document.getElementById('view-form-button')!;
var formBuilder = new FormBuilder(formBuilderContainer, formBuilderContainer.querySelector('#sidebar'));
