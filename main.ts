interface DataType {
    name: string;
    type: string;
    // additional properties
}

interface Field {
    name: string;
    label: string;
    required: boolean;
    dataType: DataType;
    // additional properties
}

interface Layout extends Component {
    name: string;
    label: string;
    columns: number;
    children: Array<Component>;
}

interface Component {
    type: string;
    field?: Field;
    layout?: Layout;
}

class FormBuilder {
    private formContainer: HTMLElement;
    private sidebarContainer: HTMLElement;
    private addLayoutButton: HTMLElement;
    private exportFormButton: HTMLElement;
    private viewFormButton: HTMLElement;
    private formLayout: Array<Component>;
    private sidebarFields: Array<Field>;
    private draggingField: HTMLElement | null = null;
    private dragStartOffsetX: number = 0;
    private dragStartOffsetY: number = 0;

    constructor(
        formContainer: HTMLElement,
        sidebarContainer: HTMLElement,
        addLayoutButton: HTMLElement,
        exportFormButton: HTMLElement,
        viewFormButton: HTMLElement
    ) {
        this.formContainer = formContainer;
        this.sidebarContainer = sidebarContainer;
        this.addLayoutButton = addLayoutButton;
        this.exportFormButton = exportFormButton;
        this.viewFormButton = viewFormButton;
        this.formLayout = [];
        this.sidebarFields = [];

        // Load fields from API
        this.loadFieldsFromApi('https://example.com/api/fields');

        // Initialize event listeners
        this.initEventListeners();

        // Render initial state
        this.renderSidebar();
    }

    async loadFieldsFromApi(apiUrl: string) {
        try {
            const response = await fetch(apiUrl);
            const json = await response.json();
            if (Array.isArray(json)) {
                this.sidebarFields = json;
                this.renderSidebar();
            } else {
                console.error('Invalid API response');
            }
        } catch (error) {
            console.error('Error loading fields from API', error);
        }
    }

    private renderSidebar() {
        const sidebar = this.sidebarContainer.querySelector('#sidebar');
        if (sidebar) {
            sidebar.innerHTML = '';
            for (const field of this.sidebarFields) {
                const fieldElement = document.createElement('li');
                fieldElement.setAttribute('class', 'field');
                fieldElement.setAttribute('draggable', 'true');
                fieldElement.dataset.field = JSON.stringify(field);
                fieldElement.innerHTML = field.label;
                sidebar.appendChild(fieldElement);
            }
        }
    }

    private initEventListeners() {
        // Event listeners for dragging and dropping fields
        this.sidebarContainer.addEventListener('dragstart', (event) => {
            if (event.target instanceof HTMLElement && event.target.matches('.field')) {
                this.draggingField = event.target;
                this.dragStartOffsetX = event.offsetX;
                this.dragStartOffsetY = event.offsetY;
            }
        });


        this.formContainer.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        this.formContainer.addEventListener('drop', (event) => {
            event.preventDefault();
            if (this.draggingField) {
                const field = JSON.parse(this.draggingField.dataset.field || '{}') as Field;
                const component: Component = {
                    type: 'field',
                    field: field
                };
                const layoutElement = this.getLayoutElementAtEvent(event);
                if (layoutElement) {
                    const layout = this.getComponentFromElement(layoutElement) as Layout|null;
                    if (layout) {
                        layout.children.push(component);
                        this.renderForm();
                    }
                } else {
                    this.formLayout.push(component);
                    this.renderForm();
                }
                this.draggingField = null;
            }
        });

        // Event listener for adding layout
        this.addLayoutButton.addEventListener('click', () => {
            const columns = prompt('Enter number of columns for layout');
            if (columns) {
                const layout: Layout = {
                    type: 'layout',
                    name: 'Layout',
                    label: 'Layout',
                    columns: parseInt(columns),
                    children: []
                };
                this.formLayout.push(layout);
                this.renderForm();
            }
        });

        // Event listener for exporting form
        this.exportFormButton.addEventListener('click', () => {
            const form = JSON.stringify(this.formLayout);
            console.log(form);
        });

        // Event listener for viewing form
        this.viewFormButton.addEventListener('click', () => {
            const form = JSON.stringify(this.formLayout);
            const formViewer = window.open('', 'Form Viewer');
            if (formViewer) {
                formViewer.document.write(`<pre>${form}</pre>`);
            }
        });
    }

    private getComponentFromElement(element: HTMLElement): Component | null {
        if (element.dataset.component) {
            const component = JSON.parse(element.dataset.component) as Component;
            return component;
        }
        return null;
    }

    private getLayoutElementAtEvent(event: DragEvent, element: HTMLElement = event.target as HTMLElement): HTMLElement | null {
        if (element.matches('.layout')) {
          return element;
        } else if (element.parentElement) {
          return this.getLayoutElementAtEvent(event, element.parentElement);
        }
        return null;
      }
      

    private renderForm() {
        this.formContainer.innerHTML = '';
        for (const component of this.formLayout) {
            const componentElement = this.createComponentElement(component);
            this.formContainer.appendChild(componentElement);
        }
    }

    private createComponentElement(component: Component): HTMLElement {
        if (component.type === 'field') {
            const field = component.field!;
            const fieldElement = document.createElement('div');
            fieldElement.setAttribute('class', 'field');
            fieldElement.setAttribute('data-component', JSON.stringify(component));
            fieldElement.innerHTML = `<label>${ field.label } </label><input type="${field.dataType.type}" required="${field.required}">`;
            return fieldElement;
        } else if (component.type === 'layout') {
            const layout = component.layout!;
            const layoutElement = document.createElement('div');
            layoutElement.setAttribute('class', 'layout');
            layoutElement.setAttribute('data-component', JSON.stringify(component));
            layoutElement.style.gridTemplateColumns = `repeat(${ layout.columns }, 1fr)`;
            for (const child of layout.children) {
                const childElement = this.createComponentElement(child);
                layoutElement.appendChild(childElement);
            }
            return layoutElement;
        }
        throw new Error(`Invalid component type: ${ component.type }`);
    }
}

// Initialize form builder
const formContainer = document.getElementById('form-container')!;
const sidebarContainer = document.getElementById('sidebar-container')!;
const addLayoutButton = document.getElementById('add-layout-button')!;
const exportFormButton = document.getElementById('export-form-button')!;
const viewFormButton = document.getElementById('view-form-button')!;
const formBuilder = new FormBuilder(formContainer, sidebarContainer, addLayoutButton, exportFormButton, viewFormButton);