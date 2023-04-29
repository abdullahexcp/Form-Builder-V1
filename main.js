var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function generate_uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var uuid = Math.random() * 16 | 0, v = c == 'x' ? uuid : (uuid & 0x3 | 0x8);
        return uuid.toString(16);
    });
}
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
    function Field(id, name, label, placeholder, required, type) {
        this.id = id !== null && id !== void 0 ? id : generate_uuidv4();
        this.name = name;
        this.label = label;
        this.placeholder = placeholder;
        this.required = required;
        this.type = type;
    }
    return Field;
}());
var FieldComponent = /** @class */ (function () {
    function FieldComponent(field, layoutColumnId, elementRef, styleClass, visible) {
        var _a;
        this.field = field;
        this.id = (_a = field.id) !== null && _a !== void 0 ? _a : generate_uuidv4();
        this.label = field.label;
        this.placeholder = field.placeholder;
        this.visible = visible !== null && visible !== void 0 ? visible : true;
        this.styleClass = styleClass !== null && styleClass !== void 0 ? styleClass : "field-component";
        this.dataType = field.type;
        this.layoutColumnId = layoutColumnId;
        this.elementRef = elementRef;
    }
    return FieldComponent;
}());
var LayoutComponent = /** @class */ (function () {
    function LayoutComponent(id, layoutColumnId, label, columns, elementRef, styleClass, visible) {
        this.id = id !== null && id !== void 0 ? id : generate_uuidv4();
        this.label = label;
        this.layoutColumnId = layoutColumnId;
        this.visible = visible !== null && visible !== void 0 ? visible : true;
        this.styleClass = styleClass !== null && styleClass !== void 0 ? styleClass : "layout-component";
        this.elementRef = elementRef;
        this.columns = columns !== null && columns !== void 0 ? columns : new Array();
    }
    return LayoutComponent;
}());
var LayoutColumnComponent = /** @class */ (function () {
    function LayoutColumnComponent(id, parentLayoutId, childrenComponents, label, elementRef, styleClass, visible) {
        this.id = id !== null && id !== void 0 ? id : generate_uuidv4();
        this.label = label;
        this.visible = visible !== null && visible !== void 0 ? visible : true;
        this.styleClass = styleClass !== null && styleClass !== void 0 ? styleClass : "layout-column-component";
        this.parentLayoutId = parentLayoutId;
        this.elementRef = elementRef;
        this.childrenComponents = childrenComponents !== null && childrenComponents !== void 0 ? childrenComponents : new Array();
    }
    return LayoutColumnComponent;
}());
// Initialize form builder
var fieldsDataSample = [
    new Field(null, "firstName", "First Name", "Enter your first name", true, new FieldType(DataTypes.SingleLineOfText, {
        maxLength: 50
    })),
    new Field(null, "lastName", "Last Name", "Enter your last name", true, new FieldType(DataTypes.SingleLineOfText, {
        maxLength: 50
    })),
    new Field(null, "age", "Age", "Enter your age", true, new FieldType(DataTypes.WholeNumber)),
    new Field(null, "gender", "Gender", "Select your gender", true, new FieldType(DataTypes.OptionSet, {
        options: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" }
        ]
    })),
    new Field(null, "birthDate", "Birth Date", "Enter your birth date", true, new FieldType(DataTypes.DateTime)),
    new Field(null, "bio", "Bio", "Enter your bio", true, new FieldType(DataTypes.MultipleLinesOfText, {
        maxLength: 500
    })),
];
var Form = /** @class */ (function () {
    function Form(formBuilderContainer, fieldsContainer, rootLayoutComponent) {
        this.formBuilderContainer = formBuilderContainer;
        this.fieldsContainer = fieldsContainer;
        this.rootLayoutComponent = rootLayoutComponent;
        this.loadFieldsList();
        this.renderFieldsList();
        this.renderRootLayoutComponent();
    }
    Form.prototype.initRootLayoutComponent = function () {
        if (!this.rootLayoutComponent) {
            this.rootLayoutComponent = this.createNewLayoutComponentIntoLayoutColumn(1, null);
            this.createNewLayoutComponentIntoLayoutColumn(2, this.rootLayoutComponent.columns[0]);
        }
        return this.rootLayoutComponent;
    };
    Form.prototype.renderRootLayoutComponent = function () {
        var rootLayoutElement = this.renderLayoutComponentToHTMLElements(this.initRootLayoutComponent());
        this.formBuilderContainer.appendChild(rootLayoutElement);
    };
    Form.prototype.createNewLayoutComponentIntoLayoutColumn = function (columnsCount, parentLayoutColumn) {
        var columnsComponents = [];
        while (columnsCount--) {
            var columnComponent = new LayoutColumnComponent();
            //columnComponent.elementRef = columnHtmlElement;
            columnsComponents.push(columnComponent);
        }
        //create root layout component and html elemnt -- with its data
        var layoutComponent = new LayoutComponent();
        // rootLayoutComponent.elementRef = rootLayoutHtmlElement;
        //bind column to layout comonent and html element
        layoutComponent.columns = columnsComponents;
        if (parentLayoutColumn) {
            layoutComponent.layoutColumnId = parentLayoutColumn.id;
            parentLayoutColumn.childrenComponents.push(layoutComponent);
        }
        return layoutComponent;
    };
    Form.prototype.createNewFieldComponentIntoLayoutComponent = function (field, parentLayoutColumn) {
        // create the field componenet 
        var fieldComponent = new FieldComponent(field, parentLayoutColumn.id);
        if (parentLayoutColumn) {
            fieldComponent.layoutColumnId = parentLayoutColumn.id;
            parentLayoutColumn.childrenComponents.push(fieldComponent);
        }
        return fieldComponent;
    };
    Form.prototype.renderFieldComponentToHTMLElement = function (fieldComponent) {
        var _a;
        //insert field visually
        var listItemElement = document.createElement("li");
        listItemElement.classList.add("field-component");
        listItemElement.dataset.field = JSON.stringify(fieldComponent.field);
        var label = document.createElement("label");
        label.innerText = (_a = fieldComponent.field) === null || _a === void 0 ? void 0 : _a.name;
        label.classList.add('field-label');
        var input = document.createElement("input");
        input.disabled = true;
        input.type = "text";
        input.placeholder = fieldComponent.field.placeholder;
        input.classList.add("field-input");
        listItemElement.appendChild(label);
        listItemElement.appendChild(input);
        //two way binding
        listItemElement.dataset.component = JSON.stringify(fieldComponent);
        listItemElement.id = fieldComponent.id;
        fieldComponent.elementRef = listItemElement;
        //setup event listner
        //select the field on click 
        var selectComponentHandler = function () {
            var _a;
            debugger;
            if (!this.selectedComponent ||
                this.selectedComponent == null ||
                fieldComponent.id != this.selectedComponent.id) {
                var resetSelectedClass = function () {
                    var selectedElements = document.getElementsByClassName('component-selected');
                    for (var i = 0; i < selectedElements.length; i++) {
                        selectedElements[i].classList.remove('component-selected');
                    }
                    ;
                };
                resetSelectedClass();
                listItemElement.classList.add('component-selected');
                this.selectedComponent = JSON.parse((_a = listItemElement.dataset.component) !== null && _a !== void 0 ? _a : "");
                this.selectedComponent = this.getComponentById(this.selectedComponent.id);
            }
            else { //unselect
                this.selectedComponent = null;
                listItemElement.classList.remove('component-selected');
            }
        };
        listItemElement.addEventListener('click', selectComponentHandler.bind(this));
        return listItemElement;
    };
    Form.prototype.renderLayoutComponentToHTMLElements = function (layoutComponent) {
        var _this = this;
        var _a;
        var layoutHtmlElement = document.createElement('div');
        layoutHtmlElement.classList.add('layout-component');
        layoutHtmlElement.id = layoutComponent.id;
        var _loop_1 = function (columnComponent) {
            var columnHtmlElement = document.createElement('div');
            columnHtmlElement.classList.add('layout-column-component');
            columnHtmlElement.dataset.component = JSON.stringify(columnComponent);
            columnHtmlElement.id = columnComponent.id;
            layoutHtmlElement.appendChild(columnHtmlElement);
            //render column children
            if (((_a = columnComponent.childrenComponents) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                columnComponent.childrenComponents.forEach(function (childComponent) {
                    if (childComponent instanceof LayoutComponent) {
                        var layoutElement = _this.renderLayoutComponentToHTMLElements(childComponent);
                        columnHtmlElement.appendChild(layoutElement);
                    }
                    else if (childComponent instanceof FieldComponent) {
                        var fieldElement = _this.renderFieldComponentToHTMLElement(childComponent);
                        columnHtmlElement.appendChild(fieldElement);
                    }
                });
            }
        };
        //render columns
        for (var _i = 0, _b = layoutComponent.columns; _i < _b.length; _i++) {
            var columnComponent = _b[_i];
            _loop_1(columnComponent);
        }
        //two way binding
        layoutHtmlElement.dataset.component = JSON.stringify(layoutComponent);
        layoutHtmlElement.id = layoutComponent.id;
        layoutComponent.elementRef = layoutHtmlElement;
        return layoutHtmlElement;
    };
    Form.prototype.renderFieldsList = function (fieldsList) {
        if (fieldsList === void 0) { fieldsList = this.fieldsList; }
        if (fieldsList == this.fieldsList) // if render all fields
            this.fieldsContainer.innerHTML = '';
        for (var _i = 0, fieldsList_1 = fieldsList; _i < fieldsList_1.length; _i++) {
            var field = fieldsList_1[_i];
            var fieldElement = document.createElement('li');
            fieldElement.setAttribute('class', 'field');
            fieldElement.setAttribute('draggable', 'true');
            fieldElement.innerHTML = field.label;
            field.elementRef = fieldElement;
            fieldElement.dataset.field = JSON.stringify(field);
            this.fieldsContainer.appendChild(fieldElement);
        }
        this.setupFieldsEventListeners();
    };
    Form.prototype.addNewLayoutComponent = function (event, colIndex) {
        if (colIndex === void 0) { colIndex = 0; }
        var parentColComponent = this.initRootLayoutComponent().columns[colIndex];
        var newLayoutComponent = this.createNewLayoutComponentIntoLayoutColumn(1, parentColComponent);
        var newLayoutElement = this.renderLayoutComponentToHTMLElements(newLayoutComponent);
        var parentColElement = document.getElementById('#' + parentColComponent.id);
        if (parentColElement)
            parentColElement.appendChild(newLayoutElement);
    };
    Form.prototype.loadFieldsList = function () {
        // Load fields from API
        // this.LoadFieldsFromApi('https://example.com/api/fields')
        //     .then((data: Array<Field>) => {
        this.fieldsList = fieldsDataSample;
        // })
        // .catch(() => {
        //     // handle the error
        // });
        // Initialize event listeners
        // this.initEventListeners();
    };
    Form.prototype.insertAndRenderFieldIntoLayoutColumn = function (fieldElement, parentColumnElement) {
        debugger;
        var dataField = fieldElement.getAttribute('data-field');
        var field = JSON.parse(dataField);
        var dataLayoutColumn = parentColumnElement.getAttribute('data-component');
        var layoutColumn = JSON.parse(dataLayoutColumn);
        //insert field visually
        var listItemElement = document.createElement("li");
        listItemElement.classList.add("field-component");
        listItemElement.dataset.field = fieldElement.getAttribute('data-field');
        // TODO : li event listner on drag
        var label = document.createElement("label");
        label.innerText = field === null || field === void 0 ? void 0 : field.name;
        label.classList.add('field-label');
        var input = document.createElement("input");
        input.disabled = true;
        input.type = "text";
        input.placeholder = field.placeholder;
        input.classList.add("field-input");
        listItemElement.appendChild(label);
        listItemElement.appendChild(input);
        // Append the list item to the unordered list
        parentColumnElement.appendChild(listItemElement);
        //#insert into form tree
        // create the field componenet 
        var fieldComponenet = new FieldComponent(field, layoutColumn.id, listItemElement);
        //set fieldcomponenet as dataset json in li htmlelement
        listItemElement.dataset.component = JSON.stringify(fieldComponenet);
        var nestedLayoutCompnent = this.getComponentById(layoutColumn.id);
        nestedLayoutCompnent.childrenComponents.push(fieldComponenet);
        //select the field on click 
        var selectComponentHandler = function () {
            var _a;
            debugger;
            var componentElement = listItemElement;
            var component = JSON.parse(componentElement.dataset.component);
            if (!this.selectedComponent ||
                this.selectedComponent == null ||
                component.id != this.selectedComponent.id) {
                var resetSelectedClass = function () {
                    var selectedElements = document.getElementsByClassName('component-selected');
                    for (var i = 0; i < selectedElements.length; i++) {
                        selectedElements[i].classList.remove('component-selected');
                    }
                    ;
                };
                resetSelectedClass();
                componentElement.classList.add('component-selected');
                this.selectedComponent = JSON.parse((_a = componentElement.dataset.component) !== null && _a !== void 0 ? _a : "");
                this.selectedComponent = this.getComponentById(this.selectedComponent.id);
            }
            else { //unselect
                this.selectedComponent = null;
                componentElement.classList.remove('component-selected');
            }
        };
        listItemElement.addEventListener('click', selectComponentHandler.bind(this));
    };
    Form.prototype.getComponentById = function (id, component) {
        if (component === void 0) { component = this.rootLayoutComponent; }
        if (!id)
            return null;
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
    Form.prototype.getHTMLElementsListOfColumnsORFieldsComponentsOfRootLayoutComponent = function (columnsComponent, elementsList) {
        if (columnsComponent === void 0) { columnsComponent = this.rootLayoutComponent.columns; }
        if (elementsList === void 0) { elementsList = []; }
        for (var _i = 0, columnsComponent_1 = columnsComponent; _i < columnsComponent_1.length; _i++) {
            var columnComponent = columnsComponent_1[_i];
            elementsList.push(columnComponent.elementRef);
            for (var _a = 0, _b = columnComponent.childrenComponents; _a < _b.length; _a++) {
                var childComponent = _b[_a];
                if (childComponent instanceof LayoutComponent) {
                    elementsList = this.getHTMLElementsListOfColumnsORFieldsComponentsOfRootLayoutComponent(childComponent.columns, elementsList);
                }
                else if (childComponent instanceof FieldComponent) {
                    elementsList.push(childComponent.elementRef);
                }
            }
        }
        return elementsList;
    };
    Form.prototype.setupFormComponentsEventListners = function () {
        var _this = this;
        var allNestedElements = this.getHTMLElementsListOfColumnsORFieldsComponentsOfRootLayoutComponent();
        allNestedElements.forEach(function (el) {
            _this.setupComponentElementEventListner(el);
        });
    };
    Form.prototype.setupComponentElementEventListner = function (el) {
        var _this = this;
        if (el.classList.contains('field-component')) {
            // darg over highlight the form componenets
            el.addEventListener('dragover', function (event) {
                event.preventDefault();
                var targetElement = event.target;
                if (targetElement.classList.contains('layout-column-component') && !targetElement.classList.contains('dragover'))
                    targetElement.classList.add('dragover');
            });
            el.addEventListener('dragleave', function (event) {
                event.preventDefault();
                var targetElement = event.target;
                targetElement.classList.remove('dragover');
            });
            el.addEventListener('drop', function (event) {
                debugger;
                event.preventDefault();
                el.classList.remove('dragover');
                // get the dragged element
                var fieldElement = _this.currentDraggedComponent;
                _this.currentDraggedComponent = undefined; //reset
                //check field is dragged 
                if (!fieldElement || fieldElement == null || !fieldElement.classList.contains('field'))
                    return;
                //insert field into component layout column
                var parentColumnElement = el.closest('.layout-column-component');
                _this.insertAndRenderFieldIntoLayoutColumn(fieldElement, parentColumnElement);
                _this.removeFieldFromFieldsListDom(fieldElement);
            });
        }
    };
    Form.prototype.removeFieldFromFieldsListDom = function (fieldElement) {
        var dataField = fieldElement.getAttribute('data-field');
        var field = JSON.parse(dataField);
        var _a = Helpers.partitionArray(this.fieldsList, function (item) { return item.id == field.id; }), pass = _a[0], failed = _a[1];
        field = (pass === null || pass === void 0 ? void 0 : pass.length) ? pass[0] : null;
        this.fieldsList = failed !== null && failed !== void 0 ? failed : this.fieldsList;
        this.fieldsContainer.removeChild(field.elementRef);
    };
    Form.prototype.setupFieldsEventListeners = function () {
        var _this = this;
        // Event listeners for dragging and dropping fields
        this.fieldsList.forEach(function (field) {
            field.elementRef.addEventListener('dragstart', function (event) {
                _this.currentDraggedComponent = field.elementRef;
            });
        });
    };
    Form.prototype.removeComponent = function () {
        var _this = this;
        debugger;
        if (!this.selectedComponent)
            return;
        var parentColumnComponent = this.getComponentById(this.selectedComponent.layoutColumnId);
        //if fieldthen add back to fields list
        if (this.selectedComponent instanceof FieldComponent) {
            var field = JSON.parse(this.selectedComponent.elementRef.getAttribute('data-field'));
            this.fieldsList.push(field);
            this.renderFieldsList([field]);
        }
        //filter column componennt children
        parentColumnComponent.childrenComponents = parentColumnComponent.childrenComponents.filter(function (c) { return c.id != _this.selectedComponent.id; });
        //remove the component from column : dom
        parentColumnComponent.elementRef.removeChild(this.selectedComponent.elementRef);
        this.selectedComponent = null;
    };
    return Form;
}());
var FormBuilder = /** @class */ (function () {
    function FormBuilder(formBuilderContainer, fieldsContainer, removeComponentBtn, addLayoutBtn, exportFormBtn, viewForm, form) {
        this.formBuilderContainer = formBuilderContainer;
        this.fieldsContainer = fieldsContainer;
        this.form = form !== null && form !== void 0 ? form : new Form(formBuilderContainer, fieldsContainer);
        this.removeComponentBtn = removeComponentBtn;
        this.addLayoutBtn = addLayoutBtn;
        this.exportFormBtn = exportFormBtn;
        this.viewForm = viewForm;
        this.initTopBarEventListners();
    }
    FormBuilder.prototype.initTopBarEventListners = function () {
        var _this = this;
        this.removeComponentBtn.addEventListener('click', this.form.removeComponent.bind(this.form));
        this.addLayoutBtn.addEventListener('click', this.form.addNewLayoutComponent.bind(this.form));
        // Event listener for exporting form
        this.exportFormBtn.addEventListener('click', function () {
            var form = _this.form;
            console.log(form);
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(_this.form));
            var dlAnchorElem = document.getElementById('downloadAnchorElem');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "scene.json");
            dlAnchorElem.click();
        });
        //     // Event listener for viewing form
        //     this.viewFormButton.addEventListener('click', () => {
        //         const form = JSON.stringify(this.formLayout);
        //         const formViewer = window.open('', 'Form Viewer');
        //         if (formViewer) {
        //             formViewer.document.write(`<pre>${form}</pre>`);
        //         }
        //     });
        // }
    };
    return FormBuilder;
}());
var formBuilderWrapper = document.getElementById('formBuilderWrapper');
var sidebarFieldsContainer = document.getElementById('sidebarFieldsContainer');
var removeComponentBtn = document.getElementById('removeComponentBtn');
var addLayoutComponentBtn = document.getElementById('addLayoutComponentBtn');
var exportFormBtn = document.getElementById('exportFormBtn');
var viewForm = document.getElementById('viewFormBtn');
// const sidebarContainer = document.getElementById('sidebar-container')!;
// const addLayoutButton = document.getElementById('add-layout-button')!;
// const exportFormButton = document.getElementById('export-form-button')!;
// const viewFormButton = document.getElementById('view-form-button')!;
var formBuilder = new FormBuilder(formBuilderWrapper, sidebarFieldsContainer, removeComponentBtn, addLayoutComponentBtn, exportFormBtn, viewForm);
var Helpers = {
    partitionArray: function (array, isValid) {
        return array.reduce(function (_a, elem) {
            var pass = _a[0], fail = _a[1];
            return isValid(elem) ? [__spreadArray(__spreadArray([], pass, true), [elem], false), fail] : [pass, __spreadArray(__spreadArray([], fail, true), [elem], false)];
        }, [[], []]);
    }
};
