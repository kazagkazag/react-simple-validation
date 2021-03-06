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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var set = require("lodash.set");
var get = require("lodash.get");
function validate(properties) {
    // todo: validate properties!
    // example: do not allow to set external property with initial value
    return function (BaseComponent) {
        return /** @class */ (function (_super) {
            __extends(WithValidation, _super);
            function WithValidation(props) {
                var _this = _super.call(this, props) || this;
                _this.synchronousState = {};
                _this.state = {
                    properties: {}
                };
                _this.synchronousState = {
                    properties: {}
                };
                _this.setStates = _this.setStates.bind(_this);
                _this.getState = _this.getState.bind(_this);
                return _this;
            }
            WithValidation.prototype.componentDidMount = function () {
                this.initializeValidatedProperties();
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
            WithValidation.prototype.initializeValidatedProperties = function () {
                var _this = this;
                var validationProps = {};
                properties.forEach(function (prop) {
                    validationProps[prop.name] = prop.list
                        ? Array.apply(null, Array(prop.length)).map(function (x, index) {
                            return ({
                                value: prop.value,
                                errors: [],
                                name: prop.name + "[" + index + "]",
                                validators: prop.validators || [],
                                fallbackError: prop.error,
                                external: false
                            });
                        })
                        : {
                            value: _this.getInitialValue(prop),
                            errors: [],
                            name: prop.name,
                            validators: prop.validators || [],
                            fallbackError: prop.error
                        };
                });
                this.setStates(function () { return ({
                    properties: validationProps
                }); });
            };
            WithValidation.prototype.getInitialValue = function (prop) {
                var getInitialValueFromPropsBasedOnName = prop.initialValueFromProps === true;
                if (getInitialValueFromPropsBasedOnName) {
                    return this.getValueFromOriginalPropsByName(prop.name);
                }
                var getInitialValueFromPropsUsingFunction = typeof prop.initialValueFromProps === "function";
                if (getInitialValueFromPropsUsingFunction) {
                    return this.getValueFromOriginalPropsUsingFn(prop.initialValueFromProps);
                }
                return prop.value === undefined ? "" : prop.value;
            };
            WithValidation.prototype.getValueFromOriginalPropsByName = function (propName) {
                return get(this.props, propName);
            };
            WithValidation.prototype.getValueFromOriginalPropsUsingFn = function (getter) {
                return getter(this.props);
            };
            WithValidation.prototype.prepareValidatedPropertiesForChild = function () {
                var _this = this;
                var validationProperties = {};
                var errorsCount = 0;
                Object.keys(this.getState().properties).forEach(function (propertyName) {
                    var property = _this.getState().properties[propertyName];
                    var isList = Array.isArray(property);
                    validationProperties[propertyName] = isList
                        ? property.map(function (propertyItem) {
                            errorsCount += propertyItem.errors.length;
                            return {
                                value: propertyItem.value,
                                errors: propertyItem.errors,
                                change: _this.getChanger(propertyItem),
                                validate: _this.getValidator(propertyItem),
                                cleanErrors: _this.getErrorCleaner(propertyItem)
                            };
                        })
                        : {
                            value: property.value,
                            errors: property.errors,
                            change: _this.getChanger(property),
                            validate: _this.getValidator(property),
                            cleanErrors: _this.getErrorCleaner(property)
                        };
                    if (!isList) {
                        errorsCount += property.errors.length;
                    }
                });
                function validateAll(callback) {
                    var isAllValid = true;
                    function validateSingle(property) {
                        return property.validate();
                    }
                    function traverseProperties(validatedProperties) {
                        Object.keys(validatedProperties).forEach(function (propertyName) {
                            if (validatedProperties[propertyName].validate) {
                                var isPropertyValid = validateSingle(validatedProperties[propertyName]);
                                if (!isPropertyValid) {
                                    isAllValid = false;
                                }
                            }
                            else if (Array.isArray(validatedProperties[propertyName])) {
                                traverseProperties(validatedProperties[propertyName]);
                            }
                        });
                    }
                    traverseProperties(validationProperties);
                    if (callback) {
                        this.forceUpdate(callback);
                    }
                    return isAllValid;
                }
                validationProperties.validator = {
                    validateAll: validateAll.bind(this),
                    errorsCount: errorsCount
                };
                return validationProperties;
            };
            WithValidation.prototype.changePropertyValue = function (propertyPath, newValue) {
                this.setStates(function (prevState) {
                    var newState = __assign({}, prevState);
                    try {
                        newState.properties[propertyPath].value = newValue;
                    }
                    catch (e) {
                        set(newState.properties, propertyPath + ".value", newValue);
                    }
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
                    var currentPropertyState;
                    // try to get property by name from state
                    // if there is property with dot in the name
                    // then it should be found
                    // if not found, try to get property by path, using lodash
                    // if there is path to property, then try {} will fail
                    // and property will be obtained by lodash
                    try {
                        currentPropertyState =
                            _this.getState().properties[property.name] !==
                                undefined
                                ? _this.getState().properties[property.name]
                                : get(_this.getState().properties, property.name);
                    }
                    catch (e) {
                        currentPropertyState = get(_this.getState().properties, property.name);
                    }
                    var errors = [];
                    property.validators.forEach(function (validator) {
                        if (!validator.fn(_this.getCurrentPropertyValue(currentPropertyState), _this.getState().properties)) {
                            errors.push(validator.error ||
                                currentPropertyState.fallbackError);
                        }
                    });
                    _this.setStates(function (prevState) {
                        var newState = __assign({}, prevState);
                        try {
                            newState.properties[property.name].errors = errors;
                        }
                        catch (e) {
                            set(newState.properties, property.name + ".errors", errors);
                        }
                        return newState;
                    });
                    return errors.length === 0 ? true : false;
                };
            };
            WithValidation.prototype.getErrorCleaner = function (property) {
                return this.cleanPropertyErrors.bind(this, property.name);
            };
            WithValidation.prototype.getCurrentPropertyValue = function (property) {
                try {
                    return this.getState().properties[property.name].value;
                }
                catch (e) {
                    return get(this.getState().properties, property.name).value;
                }
            };
            return WithValidation;
        }(React.Component));
    };
}
exports.validate = validate;
//# sourceMappingURL=validate.js.map