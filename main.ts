

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
}

class FieldComponent implements Component {
    id: string;
    dataType?: FieldType;
    field?: Field;
    layoutId?: string;
    label: string;
    visible?: boolean;
    styleClass?: string;

    constructor(id?: string, field?: Field, label?: string, fieldType?: FieldType, layoutId?: string, visible?: boolean, styleClass?: string) {
        this.id = id ?? crypto.randomUUID();
        this.field = field;
        this.label = label ?? field.label;
        this.visible = visible ?? true;
        this.styleClass = styleClass;
        this.dataType = fieldType ?? field.type;
        this.layoutId = layoutId;
    }
}

class LayoutComponent implements Component {
    id: string;
    label: string;
    columns: Array<Array<Component>>;
    visible?: boolean;
    styleClass?: string;
    constructor(id?: string, label?: string, columns?: Array<Array<Component>>, visible?: boolean, styleClass?: string) {
        this.id = id ?? crypto.randomUUID();
        this.label = label;
        this.columns = columns ?? new Array(new Array());
        this.visible = visible ?? true;
        this.styleClass = styleClass;
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
        this.fieldsHTMLElements = fieldsHTMLElements??[];
        this.sidebarContainer = sidebarElement;
        this.form = form;
        this.fieldsList = fieldsList??[];
        this.LoadSidebarFields();
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
        this.fieldsHTMLElements.forEach(el => el.addEventListener('dragend', (event) => {
            if (event.target instanceof HTMLElement && event.target.matches('.field')) {

                const fieldElement = event.target;
                this.removeField(fieldElement);

            }
        }));


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
    }
}


    const formBuilderContainer = document.getElementById('mainContainer')!;
    // const sidebarContainer = document.getElementById('sidebar-container')!;
    // const addLayoutButton = document.getElementById('add-layout-button')!;
    // const exportFormButton = document.getElementById('export-form-button')!;
    // const viewFormButton = document.getElementById('view-form-button')!;
    const formBuilder = new FormBuilder(formBuilderContainer,formBuilderContainer.querySelector('#sidebar'));
