function generate_uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function (c) {
            var uuid = Math.random() * 16 | 0, v = c == 'x' ? uuid : (uuid & 0x3 | 0x8);
            return uuid.toString(16);
        });
}

enum DataTypes {
    Text = "text",
    Number = "number",
    Lookup = "lookup",
    OptionSet = "optionSet",
    DateTime = "dateTime",
    Boolean = "boolean",
    Currency = "currency",
    SingleLineOfText = "singleLineOfText",
    MultipleLinesOfText = "multipleLinesOfText",
    WholeNumber = "wholeNumber",
    FloatingPointNumber = "floatingPointNumber",
    DateOnly = "dateOnly",
    Timezone = "timezone",
    Duration = "duration",
    DecimalNumber = "decimalNumber"
}


interface OptionSetValue {
    label: string;
    value: number | string;
}

interface FieldTypeAttributes {
    maxLength?: number;
    precision?: number;
    options?: OptionSetValue[];
}

class FieldType {
    public readonly dataType: string;
    public readonly attributes: FieldTypeAttributes;

    constructor(dataType: DataTypes, attributes?: FieldTypeAttributes) {
        this.dataType = dataType;
        this.attributes = attributes || {};
    }
}


class Field {
    id: string;
    name?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    type?: FieldType;
    elementRef: HTMLElement;
    // additional properties
    constructor(id?: string,
        name?: string,
        label?: string,
        placeholder?: string,
        required?: boolean,
        type?: FieldType) {

        this.id = id ?? generate_uuidv4();
        this.name = name;
        this.label = label;
        this.placeholder = placeholder;
        this.required = required;
        this.type = type;
    }
}

interface Component {
    id?: string;
    label?: string;
    visible?: boolean;
    styleClass?: string;
    elementRef?: HTMLElement;
    layoutColumnId?: string;
}

class FieldComponent implements Component {
    id?: string;
    dataType?: FieldType;
    field?: Field;
    layoutColumnId?: string;
    label?: string;
    placeholder?: string;
    visible?: boolean;
    styleClass?: string;
    elementRef?: HTMLElement;

    constructor(field?: Field, layoutColumnId?: string, elementRef?: HTMLElement, styleClass?: string, visible?: boolean) {
        this.field = field;
        this.id = field.id ?? generate_uuidv4();
        this.label = field.label;
        this.placeholder = field.placeholder;
        this.visible = visible ?? true;
        this.styleClass = styleClass ?? "field-component";
        this.dataType = field.type;
        this.layoutColumnId = layoutColumnId;
        this.elementRef = elementRef;
    }
}

class LayoutComponent implements Component {
    id: string;
    label: string;
    columns: Array<LayoutColumnComponent>;
    visible?: boolean;
    styleClass?: string;
    elementRef: HTMLElement;
    layoutColumnId: string;

    constructor(id?: string, layoutColumnId?: string, label?: string, columns?: Array<LayoutColumnComponent>, elementRef?: HTMLElement, styleClass?: string, visible?: boolean) {
        this.id = id ?? generate_uuidv4();
        this.label = label;
        this.layoutColumnId = layoutColumnId;
        this.visible = visible ?? true;
        this.styleClass = styleClass ?? "layout-component";
        this.elementRef = elementRef;
        this.columns = columns ?? new Array();
    }

    // private initNewColumn() {
    //     return new LayoutColumnComponent();
    // }
}

class LayoutColumnComponent implements Component {
    id: string;
    label: string;
    visible?: boolean;
    styleClass?: string;
    parentLayoutId?: string;
    childrenComponents?: Array<Component>;
    elementRef: HTMLElement;
    layoutColumnId?: string;//not used for now

    constructor(id?: string, parentLayoutId?: string, childrenComponents?: Array<Component>, label?: string, elementRef?: HTMLElement, styleClass?: string, visible?: boolean) {
        this.id = id ?? generate_uuidv4();
        this.label = label;
        this.visible = visible ?? true;
        this.styleClass = styleClass ?? "layout-column-component";
        this.parentLayoutId = parentLayoutId;
        this.elementRef = elementRef;
        this.childrenComponents = childrenComponents ?? new Array();
    }
}

// Initialize form builder
const fieldsDataSample: Field[] = [
    new Field(
        null,
        "firstName",
        "First Name",
        "Enter your first name",
        true,
        new FieldType(DataTypes.SingleLineOfText, {
            maxLength: 50
        })
    ),
    new Field(
        null,
        "lastName",
        "Last Name",
        "Enter your last name",
        true,
        new FieldType(DataTypes.SingleLineOfText, {
            maxLength: 50
        })
    ),
    new Field(
        null,
        "age",
        "Age",
        "Enter your age",
        true,
        new FieldType(DataTypes.WholeNumber)
    ),
    new Field(
        null,
        "gender",
        "Gender",
        "Select your gender",
        true,
        new FieldType(DataTypes.OptionSet, {
            options: [
                { label: "Male", value: "male" },
                { label: "Female", value: "female" }
            ]
        })
    ),
    new Field(
        null,
        "birthDate",
        "Birth Date",
        "Enter your birth date",
        true,
        new FieldType(DataTypes.DateTime)
    ),
    new Field(
        null,
        "bio",
        "Bio",
        "Enter your bio",
        true,
        new FieldType(DataTypes.MultipleLinesOfText, {
            maxLength: 500
        })
    ),
];



class Form {
    rootLayoutComponent: LayoutComponent;
    selectedComponent: Component;
    formBuilderContainer: HTMLElement;
    fieldsContainer: HTMLElement;
    fieldsList: Array<Field>;
    currentDraggedComponent: HTMLElement;
    constructor(formBuilderContainer?: HTMLElement, fieldsContainer?: HTMLElement, rootLayoutComponent?: LayoutComponent) {
        this.formBuilderContainer = formBuilderContainer;
        this.fieldsContainer = fieldsContainer;
        this.rootLayoutComponent = rootLayoutComponent;

        this.loadSidebarFields();
        this.renderFieldsList();
        this.initAndRenderRootLayoutComponent();
    }
    //todo : break down to more reusable and single responsibily
    initAndRenderRootLayoutComponent() {
        //create column component and html element -- with its data
        const columnComponent = new LayoutColumnComponent();
        const columnHtmlElement = document.createElement('div');
        columnHtmlElement.classList.add('layout-column-component');
        columnComponent.elementRef = columnHtmlElement;

        //create column component and html element -- with its data
        const columnComponent2 = new LayoutColumnComponent();
        const columnHtmlElement2 = document.createElement('div');
        columnHtmlElement2.classList.add('layout-column-component');
        columnComponent2.elementRef = columnHtmlElement2;


        //create root layout component and html elemnt -- with its data
        const rootLayoutComponent = new LayoutComponent();
        const rootLayoutHtmlElement = document.createElement('div');
        rootLayoutHtmlElement.classList.add('layout-component');
        rootLayoutComponent.elementRef = rootLayoutHtmlElement;

        //bind column to layout comonent and html element
        rootLayoutComponent.columns.push(columnComponent, columnComponent2);
        rootLayoutHtmlElement.appendChild(columnHtmlElement);
        rootLayoutHtmlElement.appendChild(columnHtmlElement2);
        columnComponent.parentLayoutId = rootLayoutComponent.id;
        columnComponent2.parentLayoutId = rootLayoutComponent.id;

        this.rootLayoutComponent = rootLayoutComponent;

        // bind dataset on html elements
        columnHtmlElement.dataset.component = JSON.stringify(columnComponent);
        columnHtmlElement2.dataset.component = JSON.stringify(columnComponent2);
        rootLayoutHtmlElement.dataset.component = JSON.stringify(rootLayoutComponent);
        //insert the layout component and html element into container and set html to rootlayout
        this.formBuilderContainer.appendChild(rootLayoutHtmlElement);
        //
        //
        this.initFormComponentsEventListners();
    }

    //todo
    renderLayoutComponent(layoutComponenet: LayoutComponent) {
        //todo implementation
    }

    renderFieldsList(fieldsList = this.fieldsList) {

        if (fieldsList == this.fieldsList)// if render all fields
            this.fieldsContainer.innerHTML = '';

        for (let field of fieldsList) {
            const fieldElement = document.createElement('li');
            fieldElement.setAttribute('class', 'field');
            fieldElement.setAttribute('draggable', 'true');
            fieldElement.innerHTML = field.label;
            field.elementRef = fieldElement;
            fieldElement.dataset.field = JSON.stringify(field);
            this.fieldsContainer.appendChild(fieldElement);
        }

        this.initFieldsEventListeners();

    }

    loadSidebarFields() {
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

    }

    insertAndRenderFieldIntoLayoutColumn(fieldElement: HTMLElement, parentColumnElement: HTMLElement) {
        debugger
        const dataField = fieldElement.getAttribute('data-field');
        const field = JSON.parse(dataField);
        const dataLayoutColumn = parentColumnElement.getAttribute('data-component');
        const layoutColumn = JSON.parse(dataLayoutColumn);


        //insert field visually
        const listItemElement = document.createElement("li");
        listItemElement.classList.add("field-component");
        listItemElement.dataset.field = fieldElement.getAttribute('data-field');
        // TODO : li event listner on drag

        const label = document.createElement("label");
        label.innerText = field?.name;
        label.classList.add('field-label');

        const input = document.createElement("input");
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
        let fieldComponenet = new FieldComponent(field, layoutColumn.id, listItemElement);
        //set fieldcomponenet as dataset json in li htmlelement
        listItemElement.dataset.component = JSON.stringify(fieldComponenet);
        let nestedLayoutCompnent = this.getComponentById(layoutColumn.id) as LayoutColumnComponent;
        nestedLayoutCompnent.childrenComponents.push(fieldComponenet);

        //select the field on click 
        const selectComponentHandler = function () {
            debugger

            const componentElement = listItemElement;
            const component = JSON.parse(componentElement.dataset.component);

            if (!this.selectedComponent ||
                this.selectedComponent == null ||
                component.id != this.selectedComponent.id) {

                const resetSelectedClass = () => {
                    const selectedElements = document.getElementsByClassName('component-selected');
                    for (let i = 0; i < selectedElements.length; i++) {
                        selectedElements[i].classList.remove('component-selected');
                    };
                }
                resetSelectedClass();
                componentElement.classList.add('component-selected');
                this.selectedComponent = JSON.parse(componentElement.dataset.component ?? "");
                this.selectedComponent = this.getComponentById(this.selectedComponent.id);
            }
            else {//unselect
                this.selectedComponent = null;
                componentElement.classList.remove('component-selected');
            }
        }

        listItemElement.addEventListener('click', selectComponentHandler.bind(this));
    }

    getComponentById(id: string, component: Component = this.rootLayoutComponent): Component | undefined {
        if (component.id === id) {
            return component;
        }

        if (component instanceof LayoutComponent) {
            for (let column of component.columns) {
                const result = this.getComponentById(id, column);
                if (result) {
                    return result;
                }
            }
        }

        if (component instanceof LayoutColumnComponent) {
            for (let child of component.childrenComponents || []) {
                const result = this.getComponentById(id, child);
                if (result) {
                    return result;
                }
            }
        }

        return undefined;
    }

    getHTMLElementsListOfColumnsORFieldsComponentsOfRootLayoutComponent(
        columnsComponent: LayoutColumnComponent[] = this.rootLayoutComponent.columns,
        elementsList: HTMLElement[] = []) {

        for (let columnComponent of columnsComponent) {
            elementsList.push(columnComponent.elementRef);
            for (let childComponent of columnComponent.childrenComponents) {
                if (childComponent instanceof LayoutComponent) {
                    elementsList = this.getHTMLElementsListOfColumnsORFieldsComponentsOfRootLayoutComponent(childComponent.columns, elementsList);
                } else if (childComponent instanceof FieldComponent) {
                    elementsList.push(childComponent.elementRef);
                }
            }
        }
        return elementsList;
    }

    initFormComponentsEventListners() {
        var allNestedElements = this.getHTMLElementsListOfColumnsORFieldsComponentsOfRootLayoutComponent();
        allNestedElements.forEach(el => {

            // darg over highlight the form componenets
            el.addEventListener('dragover', (event) => {
                event.preventDefault();
                const targetElement = event.target as HTMLElement;
                if (targetElement.classList.contains('layout-column-component') && !targetElement.classList.contains('dragover'))
                    targetElement.classList.add('dragover');
            });
            el.addEventListener('dragleave', (event) => {
                event.preventDefault();
                const targetElement = event.target as HTMLElement;
                targetElement.classList.remove('dragover');
            });

            el.addEventListener('drop', (event: any) => {
                debugger
                event.preventDefault();
                el.classList.remove('dragover');
                // get the dragged element
                const fieldElement = this.currentDraggedComponent;
                this.currentDraggedComponent = undefined;//reset
                //check field is dragged 
                if (!fieldElement || fieldElement == null || !fieldElement.classList.contains('field'))
                    return;
                //insert field into component layout column
                const parentColumnElement = el.closest('.layout-column-component') as HTMLElement;

                this.insertAndRenderFieldIntoLayoutColumn(fieldElement, parentColumnElement);

                this.removeFieldFromFieldsListDom(fieldElement);
            });
        });
    }

    removeFieldFromFieldsListDom(fieldElement: HTMLElement) {
        const dataField = fieldElement.getAttribute('data-field');
        let field = JSON.parse(dataField);
        const [pass, failed] = Helpers.partitionArray(this.fieldsList, (item) => item.id == field.id);
        field = pass?.length ? pass[0] : null;
        this.fieldsList = failed ?? this.fieldsList;
        this.fieldsContainer.removeChild(field.elementRef);
    }

    initFieldsEventListeners() {
        // Event listeners for dragging and dropping fields
        this.fieldsList.forEach(field => {
            field.elementRef.addEventListener('dragstart', (event) => {
                this.currentDraggedComponent = field.elementRef;
            });
        });
    }

    removeComponent() {
        debugger
        if (!this.selectedComponent)
            return;
        const parentColumnComponent = this.getComponentById(this.selectedComponent.layoutColumnId) as LayoutColumnComponent;

        //if fieldthen add back to fields list
        if (this.selectedComponent instanceof FieldComponent) {
            const field = JSON.parse(this.selectedComponent.elementRef.getAttribute('data-field'));
            this.fieldsList.push(field);
            this.renderFieldsList([field]);
        }

        //filter column componennt children
        parentColumnComponent.childrenComponents = parentColumnComponent.childrenComponents.filter(c => c.id != this.selectedComponent.id);
        //remove the component from column : dom
        parentColumnComponent.elementRef.removeChild(this.selectedComponent.elementRef);
        this.selectedComponent = null;
    }

    //todo
    // InsertLayoutIntoLayoutColumn( targetElement: HTMLElement) {
    // }

}



class FormBuilder {
    form: Form;

    formBuilderContainer: HTMLElement;
    fieldsContainer: HTMLElement;
    currentDraggedComponent: HTMLElement;
    removeComponentBtn: HTMLElement;
    addLayoutBtn: HTMLElement;
    exportFormBtn: HTMLElement;
    viewForm: HTMLElement;

    constructor(
        formBuilderContainer?: HTMLElement,
        fieldsContainer?: HTMLElement,
        removeComponentBtn?: HTMLElement,
        addLayoutBtn?: HTMLElement,
        exportFormBtn?: HTMLElement,
        viewForm?: HTMLElement,
        form?: Form
    ) {
        this.formBuilderContainer = formBuilderContainer;
        this.fieldsContainer = fieldsContainer;
        this.form = form ?? new Form(formBuilderContainer, fieldsContainer);
        this.removeComponentBtn = removeComponentBtn;
        this.addLayoutBtn = addLayoutBtn;
        this.exportFormBtn = exportFormBtn;
        this.viewForm = viewForm;

        this.initTopBarEventListners();
    }

    initTopBarEventListners() {
        this.removeComponentBtn.addEventListener('click', this.form.removeComponent.bind(this.form))

        // Event listener for exporting form
        this.exportFormBtn.addEventListener('click', () => {
            const form = this.form;
            console.log(form);
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.form));
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
    }
}


const formBuilderWrapper = document.getElementById('formBuilderWrapper')!;
const sidebarFieldsContainer = document.getElementById('sidebarFieldsContainer')!;
const removeComponentBtn = document.getElementById('removeComponentBtn');
const addLayoutComponentBtn = document.getElementById('addLayoutComponentBtn');
const exportFormBtn = document.getElementById('exportFormBtn');
const viewForm = document.getElementById('viewFormBtn');

// const sidebarContainer = document.getElementById('sidebar-container')!;
// const addLayoutButton = document.getElementById('add-layout-button')!;
// const exportFormButton = document.getElementById('export-form-button')!;
// const viewFormButton = document.getElementById('view-form-button')!;
const formBuilder = new FormBuilder(formBuilderWrapper, sidebarFieldsContainer, removeComponentBtn, addLayoutComponentBtn, exportFormBtn, viewForm);

const Helpers = {
    partitionArray: function (array, isValid) {
        return array.reduce(([pass, fail], elem) => {
            return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
        }, [[], []]);
    }
}