"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var set = require("lodash.set");
var get = require("lodash.get");
var validatedProperties_1 = require("./validatedProperties/validatedProperties");
function validate(properties, propertiesGenerator) {
    // todo: validate properties!
    // example: do not allow to set external property with initial value
    return function (BaseComponent) {
        return /** @class */ (function (_super) {
            __extends(WithValidation, _super);
            function WithValidation(props) {
                var _this = _super.call(this, props) || this;
                _this.computedProperties = [];
                _this.synchronousState = {};
                var initliazedProps = _this.initializeValidatedProperties();
                _this.state = {
                    properties: initliazedProps
                };
                _this.synchronousState = {
                    properties: initliazedProps
                };
                _this.setStates = _this.setStates.bind(_this);
                _this.getState = _this.getState.bind(_this);
                return _this;
            }
            WithValidation.prototype.componentDidUpdate = function (oldProps) {
                this.syncValues(oldProps);
            };
            WithValidation.prototype.render = function () {
                var validatedProperties = this.prepareValidatedPropertiesForChild();
                return (React.createElement(BaseComponent, __assign({}, this.props, validatedProperties)));
            };
            WithValidation.prototype.setStates = function (updater, callback) {
                this.synchronousState = updater(this.synchronousState);
                this.setState(updater, callback);
            };
            WithValidation.prototype.getState = function () {
                return this.synchronousState;
            };
            WithValidation.prototype.syncValues = function (oldProps) {
                var _this = this;
                var propertiesToChange = [];
                this.computedProperties.forEach(function (p) {
                    if (!p.syncValue) {
                        return;
                    }
                    var oldValue;
                    var newValue;
                    if (typeof p.syncValue === "boolean") {
                        oldValue = validatedProperties_1.getValueFromOriginalPropsByName(p.name, oldProps);
                        newValue = validatedProperties_1.getValueFromOriginalPropsByName(p.name, _this.props);
                    }
                    if (typeof p.syncValue === "function") {
                        oldValue = validatedProperties_1.getValueFromOriginalPropsUsingFn(p.syncValue, oldProps);
                        newValue = validatedProperties_1.getValueFromOriginalPropsUsingFn(p.syncValue, _this.props);
                    }
                    if (oldValue === newValue) {
                        return;
                    }
                    propertiesToChange.push([p.name, newValue]);
                });
                if (propertiesToChange.length) {
                    this.changePropertiesValues(propertiesToChange);
                }
            };
            WithValidation.prototype.initializeValidatedProperties = function () {
                this.computedProperties = __spreadArrays(properties, validatedProperties_1.dynamicValidationProperties(propertiesGenerator, this.props));
                return validatedProperties_1.toValidatedProperties(this.computedProperties, this.props);
            };
            WithValidation.prototype.prepareValidatedPropertiesForChild = function () {
                var _this = this;
                var propertiesForChild = {};
                var errorsCount = 0;
                Object.keys(this.getState().properties).forEach(function (propertyName) {
                    var property = _this.getState().properties[propertyName];
                    propertiesForChild[propertyName] = {
                        value: property.value,
                        errors: property.errors,
                        change: _this.getChanger(property),
                        validate: _this.getValidator(property),
                        cleanErrors: _this.getErrorCleaner(property)
                    };
                    errorsCount += property.errors.length;
                });
                propertiesForChild.validator = {
                    validateAll: validatedProperties_1.createValidateAll(propertiesForChild, this.forceUpdate.bind(this)),
                    errorsCount: errorsCount
                };
                return propertiesForChild;
            };
            WithValidation.prototype.changePropertiesValues = function (propsToChange) {
                this.setStates(function (prevState) {
                    var newState = __assign({}, prevState);
                    propsToChange.forEach(function (_a) {
                        var path = _a[0], value = _a[1];
                        set(newState.properties, path + ".value", value);
                    });
                    return newState;
                });
            };
            WithValidation.prototype.changePropertyValue = function (propertyPath, newValue) {
                this.setStates(function (prevState) {
                    var newState = __assign({}, prevState);
                    set(newState.properties, propertyPath + ".value", newValue);
                    return newState;
                });
            };
            WithValidation.prototype.cleanPropertyErrors = function (propertyPath) {
                this.setStates(function (prevState) {
                    var newState = __assign({}, prevState);
                    try {
                        newState.properties[propertyPath].errors = [];
                    }
                    catch (e) {
                        set(newState.properties, propertyPath + ".errors", []);
                    }
                    return newState;
                });
            };
            WithValidation.prototype.getChanger = function (property) {
                var _this = this;
                return function (newValue) {
                    return _this.changePropertyValue(property.name, newValue);
                };
            };
            WithValidation.prototype.getValidator = function (property) {
                var _this = this;
                return function () {
                    var currentPropertyState = get(_this.getState().properties, property.name);
                    var errors = [];
                    property.validators.forEach(function (validator) {
                        if (!validator.fn(_this.getCurrentPropertyValue(currentPropertyState), _this.getState().properties)) {
                            errors.push(validator.error ||
                                currentPropertyState.fallbackError);
                        }
                    });
                    var afterValidationErrors = null;
                    var newState = __assign({}, _this.state);
                    set(newState.properties, property.name + ".errors", errors);
                    if (get(newState.properties, property.name + ".errors").length) {
                        afterValidationErrors = get(newState.properties, property.name + ".errors");
                    }
                    _this.setStates(function () { return newState; });
                    return {
                        isValid: afterValidationErrors === null,
                        errors: afterValidationErrors
                    };
                };
            };
            WithValidation.prototype.getErrorCleaner = function (property) {
                return this.cleanPropertyErrors.bind(this, property.name);
            };
            WithValidation.prototype.getCurrentPropertyValue = function (property) {
                return get(this.getState().properties, property.name).value;
            };
            return WithValidation;
        }(React.Component));
    };
}
exports.validate = validate;
//# sourceMappingURL=validate.js.map