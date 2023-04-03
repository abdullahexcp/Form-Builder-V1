

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
        this.styleClass = styleClass??"field-component";
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
        this.styleClass = styleClass??"layout-component";
        this.elementRef = elementRef;
        this.columns = columns ?? new Array(this.initNewColumn());
    }

    private initNewColumn() {
        return new LayoutColumnComponent(crypto.randomUUID());
    }
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
        this.styleClass = styleClass??"layout-column-component";
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

    getFormAllNestedHtmlElementsAsList(): Array<HTMLElement> {
        const elements: Array<HTMLElement> = [];

        const traverseComponents = (components: Array<Component>) => {
            components.forEach((component) => {
                if (component instanceof LayoutComponent) {
                    traverseComponents(component.columns.flat());
                } else if (component instanceof FieldComponent) {
                    if (component.elementRef) {
                        elements.push(component.elementRef);
                    }
                }
            });
        };

        if (this.rootLayoutComponent) {
            traverseComponents(this.rootLayoutComponent.columns.flat());
        }

        return elements;
    }

    insertFieldIntoLayoutColumn(fieldElement: HTMLElement, targetElement: HTMLElement) {
        const dataField = fieldElement.getAttribute('data-field');
        const field = JSON.parse(dataField);
        const parentColumnElement = targetElement.closest('.layout-column-component') as HTMLElement;
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


    getClosestColumn(eventTarget: HTMLElement): LayoutComponent | undefined {
        let layoutElement = eventTarget.closest('.layout') as HTMLElement;
        if (layoutElement) {
            const layoutId = layoutElement.dataset.componentId;
            const layoutComponent = this.form.getComponentById(layoutId) as LayoutComponent;
            return layoutComponent;
        }
        return undefined;
    }

    getComponentById(id: string): Component | undefined {
        // Check if the id of the root layout component matches the given id
        if (this.rootLayoutComponent.id === id) {
            return this.rootLayoutComponent;
        }

        // Recursive search for the component with the given id
        function searchComponent(component: Component): Component | undefined {
            // If the component id matches the given id, return the component
            if (component.id === id) {
                return component;
            }

            // If the component is a layout component, search in all its nested components
            if (component instanceof LayoutComponent) {
                for (const column of component.columns) {
                    for (const nestedComponent of column) {
                        const result = searchComponent(nestedComponent);
                        if (result) {
                            return result;
                        }
                    }
                }
            }

            // If the component is a field component, search in its parent layout component
            if (component instanceof FieldComponent && component.field) {
                const parentComponent = searchComponent(component.field);
                if (parentComponent instanceof LayoutComponent) {
                    return parentComponent;
                }
            }

            // If the component is not found, return undefined
            console.error(`Component with id ${componentId} not found`);
            return;

        }

        // Start the recursive search from the root layout component
        return searchComponent(this.rootLayoutComponent);
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
        this.fieldsHTMLElements = fieldsHTMLElements ?? [];
        this.sidebarContainer = sidebarElement;
        this.form = form;
        this.fieldsList = fieldsList ?? [];
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
                this.form.insertFieldIntoLayoutColumn(fieldElement, targetElement);

                this.removeField(fieldElement);

                // // check if layout insert to its column directly 
                // if (targetElement.classList.contains('layout-column')) {
                //     const columnIndex = Array.from(targetElement.parentElement.children).indexOf(targetElement);
                //     this.form.insertFieldIntoLayoutColumn(component, columnIndex);
                // }
                // // else if field component then get its parent from form object then insert into the column array of the field
                // else if (targetElement.classList.contains('field')) {
                //     const fieldId = targetElement.dataset.fieldId;
                //     const field = this.form.getFieldById(fieldId);
                //     const columnIndex = field.columnIndex;

                //     if (!field) {
                //         console.error(`Field with id ${fieldId} not found`);
                //         return;
                //     }

                //     this.form.insertComponentIntoLayout(component, field, columnIndex);
                // }

                // // add function called (on insert component to layout column array ) to insert it to the dom 
                // this.insertComponentIntoDOM(component);
            });
        });


        var allNestedElements = this.form.getFormAllNestedHtmlElementsAsList();
        allNestedElements.forEach(el => {

            // darg over highlight the form componenets
            el.addEventListener('dragover', (event) => {
                event.preventDefault();
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
        }
}


    const formBuilderContainer = document.getElementById('mainContainer')!;
    // const sidebarContainer = document.getElementById('sidebar-container')!;
    // const addLayoutButton = document.getElementById('add-layout-button')!;
    // const exportFormButton = document.getElementById('export-form-button')!;
    // const viewFormButton = document.getElementById('view-form-button')!;
    const formBuilder = new FormBuilder(formBuilderContainer, formBuilderContainer.querySelector('#sidebar'));
