var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
        this.loadFieldsFromApi('https://example.com/api/fields');
        // Initialize event listeners
        this.initEventListeners();
        // Render initial state
        this.renderSidebar();
    }
    FormBuilder.prototype.loadFieldsFromApi = function (apiUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var response, json, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch(apiUrl)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        json = _a.sent();
                        if (Array.isArray(json)) {
                            this.sidebarFields = json;
                            this.renderSidebar();
                        }
                        else {
                            console.error('Invalid API response');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error loading fields from API', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
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
