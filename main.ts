const crypto = require('crypto');

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
    required?: boolean;
    type?: FieldType;
    // additional properties
    constructor(id?: string,
        name?: string,
        label?: string,
        required?: boolean,
        type?: FieldType) {

        this.id = id;
        this.name = name;
        this.label = label;
        this.required = required;
        this.type = type;
    }
}

interface Component {
    id: string;
    label: string;
    visible?: boolean;
    styleClass?: string;
    elementRef: HTMLElement;
}

class FieldComponent implements Component {
    id: string;
    dataType?: FieldType;
    field?: Field;
    layoutColumnId?: string;
    label: string;
    visible?: boolean;
    styleClass?: string;
    elementRef: HTMLElement;

    constructor(id?: string, field?: Field, label?: string, fieldType?: FieldType, layoutColumnId?: string, elementRef?: HTMLElement, styleClass?: string, visible?: boolean) {
        this.id = id ?? crypto.randomUUID();
        this.field = field;
        this.label = label ?? field.label;
        this.visible = visible ?? true;
        this.styleClass = styleClass ?? "field-component";
        this.dataType = fieldType ?? field.type;
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

    constructor(id?: string, label?: string, columns?: Array<LayoutColumnComponent>, elementRef?: HTMLElement, styleClass?: string, visible?: boolean) {
        this.id = id ?? crypto.randomUUID();
        this.label = label;
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

    constructor(id?: string, parentLayoutId?: string, label?: string, elementRef?: HTMLElement, styleClass?: string, visible?: boolean) {
        this.id = id ?? crypto.randomUUID();
        this.label = label;
        this.visible = visible ?? true;
        this.styleClass = styleClass ?? "layout-column-component";
        this.parentLayoutId = parentLayoutId;
        this.elementRef = elementRef;
    }
}

// Initialize form builder
const fieldsDataSample: Field[] = [
    new Field(
        "firstName",
        "First Name",
        "Enter your first name",
        true,
        new FieldType(DataTypes.SingleLineOfText, {
            maxLength: 50
        })
    ),
    new Field(
        "lastName",
        "Last Name",
        "Enter your last name",
        true,
        new FieldType(DataTypes.SingleLineOfText, {
            maxLength: 50
        })
    ),
    new Field(
        "age",
        "Age",
        "Enter your age",
        true,
        new FieldType(DataTypes.WholeNumber)
    ),
    new Field(
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
        "birthDate",
        "Birth Date",
        "Enter your birth date",
        true,
        new FieldType(DataTypes.DateTime)
    ),
    new Field(
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
    constructor(rootLayoutComponent?: LayoutComponent) {
        this.rootLayoutComponent = rootLayoutComponent;
    }


    insertFieldIntoLayoutColumn(fieldElement: HTMLElement, parentColumnElement: HTMLElement) {

        const dataField = fieldElement.getAttribute('data-field');
        const field = JSON.parse(dataField);
        const dataLayoutColumn = parentColumnElement.getAttribute('data-col');
        const layoutColumn = JSON.parse(dataLayoutColumn);


        //insert field visually
        const listItemElement = document.createElement("li");
        listItemElement.draggable = true;

        // TODO : li event listner on drag

        const label = document.createElement("label");
        label.innerText = field?.name;

        const input = document.createElement("input");
        input.disabled = true;
        input.type = "text";
        input.placeholder = field.name;

        listItemElement.appendChild(label);
        listItemElement.appendChild(input);

        // Append the list item to the unordered list
        parentColumnElement.appendChild(listItemElement);

        //#insert into form tree
        // create the field componenet 
        let fieldComponenet = new FieldComponent(field.id, field, field.name, field.type, layoutColumn.id, listItemElement);
        //set fieldcomponenet as dataset json in li htmlelement
        listItemElement.dataset.fieldComponent = JSON.stringify(fieldComponenet);
        let nestedLayoutCompnent = this.getComponentById(layoutColumn.id) as LayoutColumnComponent;
        nestedLayoutCompnent.childrenComponents.push(fieldComponenet);

    }

    getComponentById(id: string, component: Component = this.rootLayoutComponent): Component | undefined {
        if (component.id === id) {
            return component;
        }

        if (component instanceof LayoutComponent) {
            for (const column of component.columns) {
                const result = this.getComponentById(id, column);
                if (result) {
                    return result;
                }
            }
        }

        if (component instanceof LayoutColumnComponent) {
            for (const child of component.childrenComponents || []) {
                const result = this.getComponentById(id, child);
                if (result) {
                    return result;
                }
            }
        }

        return undefined;
    }

    getNestedHTMLElementsListOfColumnsORFieldsComponents(
        columnsComponent: LayoutColumnComponent[] = this.rootLayoutComponent.columns,
        elementsList: HTMLElement[] = []) {
        for (const columnComponent of columnsComponent) {
            elementsList.push(columnComponent.elementRef);
            for (const childComponent of columnComponent.childrenComponents) {
                if (childComponent instanceof LayoutComponent) {
                    elementsList = this.getNestedHTMLElementsListOfColumnsORFieldsComponents(childComponent.columns, elementsList);
                } else if (childComponent instanceof FieldComponent) {
                    elementsList.push(childComponent.elementRef);
                }
            }
        }
        return elementsList;
    }

    //todo
    // InsertLayoutIntoLayoutColumn( targetElement: HTMLElement) {

    //     const parentColumnElement = targetElement.closest('.layout-column-component') as HTMLElement;
    //     const dataLayoutColumn = parentColumnElement.getAttribute('data-col');
    //     const layoutColumn = JSON.parse(dataLayoutColumn);


    //     //insert field visually
    //     const listItemElement = document.createElement("div");
    //     listItemElement.draggable = true;

    //     // TODO : li event listner on drag

    //     const label = document.createElement("label");
    //     label.innerText = field?.name;

    //     const input = document.createElement("input");
    //     input.disabled = true;
    //     input.type = "text";
    //     input.placeholder = field.name;

    //     listItemElement.appendChild(label);
    //     listItemElement.appendChild(input);

    //     // Append the list item to the unordered list
    //     parentColumnElement.appendChild(listItemElement);

    //     //#insert into form tree
    //     // create the field componenet 
    //     let fieldComponenet = new FieldComponent(field.id, field, field.name, field.type, layoutColumn.id, listItemElement);
    //     //set fieldcomponenet as dataset json in li htmlelement
    //     listItemElement.dataset.fieldComponent = JSON.stringify(fieldComponenet);
    //     let nestedLayoutCompnent = this.getComponentById(layoutColumn.id) as LayoutColumnComponent;
    //     nestedLayoutCompnent.childrenComponents.push(fieldComponenet);
    // }

}



class FormBuilder {
    form: Form;
    fieldsList: Array<Field>;
    formBuilderContainer: HTMLElement;
    fieldsHTMLElements: Array<HTMLElement>;
    sidebarContainer: HTMLElement;
    constructor(
        formBuilderContainer?: HTMLElement,
        sidebarElement?: HTMLElement,
        fieldsHTMLElements?: Array<HTMLElement>,
        form?: Form,
        fieldsList?: Array<Field>
    ) {
        this.formBuilderContainer = formBuilderContainer;
        this.fieldsHTMLElements = fieldsHTMLElements ?? [];
        this.sidebarContainer = sidebarElement;
        this.form = form ?? new Form();
        this.fieldsList = fieldsList ?? [];
        this.initAndRenderRootLayoutComponent();
        this.LoadSidebarFields();
    }

    initAndRenderRootLayoutComponent() {
        //create column component and html element -- with its data
        const columnComponent = new LayoutColumnComponent();
        const columnHtmlElement = document.createElement('div');
        columnHtmlElement.classList.add('layout-column-component');
        columnComponent.elementRef = columnHtmlElement;

        //create root layout component and html elemnt -- with its data
        const rootLayoutComponent = new LayoutComponent();
        const rootLayoutHtmlElement = document.createElement('div');
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
    }

    LoadSidebarFields() {
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

    }

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


    private renderSidebar() {

        if (this.sidebarContainer) {
            this.sidebarContainer.innerHTML = '';
            for (const field of this.fieldsList) {
                const fieldElement = document.createElement('li');
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
    }



    private removeField(fieldElement: HTMLElement) {
        const dataField = fieldElement.getAttribute('data-field');
        const field = JSON.parse(dataField);
        //remove from sidebar fields list
        this.fieldsList = this.fieldsList.filter(item => item.id != field.id);

        // remove from sidebar html 
        this.fieldsHTMLElements = this.fieldsHTMLElements.filter(item => item != fieldElement);
        this.sidebarContainer.removeChild(fieldElement);
    }

    private initFieldsEventListeners() {
        // Event listeners for dragging and dropping fields
        this.fieldsHTMLElements.forEach(fieldElement => {
            // read the id from the dataset  and get the component
            // el.addEventListener('dragend', (event) => {
            //     if (event.target instanceof HTMLElement && event.target.matches('.field')) {

            //         const fieldElement = event.target;
            //         this.removeField(fieldElement);

            //     }
            // });
            // insert componenet on drop
            fieldElement.addEventListener('drop', (event) => {
                event.preventDefault();

                // get the event element 
                const targetElement = event.target as HTMLElement;
                //insert field into component layout column
                const parentColumnElement = targetElement.closest('.layout-column-component') as HTMLElement;
                targetElement.classList.remove('dragover');

                this.form.insertFieldIntoLayoutColumn(fieldElement, parentColumnElement);

                this.removeField(fieldElement);
            });
        });


        var allNestedElements = this.form.getNestedHTMLElementsListOfColumnsORFieldsComponents();
        allNestedElements.forEach(el => {

            // darg over highlight the form componenets
            el.addEventListener('dragover', (event) => {
                event.preventDefault();
                const targetElement = event.target as HTMLElement;
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
    }
}


const formBuilderContainer = document.getElementById('mainContainer')!;
// const sidebarContainer = document.getElementById('sidebar-container')!;
// const addLayoutButton = document.getElementById('add-layout-button')!;
// const exportFormButton = document.getElementById('export-form-button')!;
// const viewFormButton = document.getElementById('view-form-button')!;
const formBuilder = new FormBuilder(formBuilderContainer, formBuilderContainer.querySelector('#sidebar'));
