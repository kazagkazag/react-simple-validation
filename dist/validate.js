"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var set = require("lodash.set");
var get = require("lodash.get");
function validate(properties) {
    return function (BaseComponent) {
        return /** @class */ (function (_super) {
            __extends(WithValidation, _super);
            function WithValidation(props) {
                var _this = _super.call(this, props) || this;
                _this.state = {
                    properties: {}
                };
                return _this;
            }
            WithValidation.prototype.componentDidMount = function () {
                this.initializeValidatedProperties();
            };
            WithValidation.prototype.render = function () {
                var validatedProperties = this.prepareValidatedPropertiesForChild();
                return (React.createElement(BaseComponent, __assign({}, this.props, validatedProperties)));
            };
            WithValidation.prototype.initializeValidatedProperties = function () {
                var validationProps = {};
                properties.forEach(function (prop) {
                    validationProps[prop.name] = prop.list
                        ? Array.apply(null, Array(prop.length)).map(function (x, index) { return ({
                            value: prop.value,
                            errors: [],
                            name: prop.name + "[" + index + "]",
                            validators: prop.validators,
                            fallbackError: prop.error
                        }); })
                        : {
                            value: prop.value,
                            errors: [],
                            name: prop.name,
                            validators: prop.validators,
                            fallbackError: prop.error
                        };
                });
                this.setState({
                    properties: validationProps
                });
            };
            WithValidation.prototype.prepareValidatedPropertiesForChild = function () {
                var _this = this;
                var validationProperties = {};
                Object
                    .keys(this.state.properties)
                    .forEach(function (propertyName) {
                    var property = _this.state.properties[propertyName];
                    validationProperties[propertyName] = Array.isArray(property)
                        ? property.map(function (propertyItem) { return ({
                            value: propertyItem.value,
                            errors: propertyItem.errors,
                            change: _this.getChanger(propertyItem),
                            validate: _this.getValidator(propertyItem),
                            cleanErrors: _this.getErrorCleaner(propertyItem)
                        }); }) : {
                        value: property.value,
                        errors: property.errors,
                        change: _this.getChanger(property),
                        validate: _this.getValidator(property),
                        cleanErrors: _this.getErrorCleaner(property)
                    };
                });
                function validateAll(callback) {
                    function validateSingle(property) {
                        property.validate();
                    }
                    function traverseProperties(validatedProperties) {
                        Object
                            .keys(validatedProperties)
                            .forEach(function (propertyName) {
                            if (validatedProperties[propertyName].validate) {
                                validateSingle(validatedProperties[propertyName]);
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
                }
                validationProperties.validator = {
                    validateAll: validateAll.bind(this)
                };
                return validationProperties;
            };
            WithValidation.prototype.changePropertyValue = function (propertyPath, newValue) {
                this.setState(function (prevState) {
                    var newState = __assign({}, prevState);
                    set(newState.properties, propertyPath + ".value", newValue);
                    return newState;
                });
            };
            WithValidation.prototype.cleanPropertyErrors = function (propertyPath) {
                this.setState(function (prevState) {
                    var newState = __assign({}, prevState);
                    set(newState.properties, propertyPath + ".errors", []);
                    return newState;
                });
            };
            WithValidation.prototype.getChanger = function (property) {
                var _this = this;
                return function (newValue) { return _this.changePropertyValue(property.name, newValue); };
            };
            WithValidation.prototype.getValidator = function (property) {
                var _this = this;
                return function () {
                    var currentPropertyState = get(_this.state.properties, property.name);
                    var errors = [];
                    property.validators.forEach(function (validator) {
                        if (!validator.fn(currentPropertyState.value, _this.state.properties)) {
                            errors.push(validator.error || currentPropertyState.fallbackError);
                        }
                    });
                    if (errors.length) {
                        _this.setState(function (prevState) {
                            var newState = __assign({}, prevState);
                            set(newState.properties, property.name + ".errors", errors);
                            return newState;
                        });
                    }
                };
            };
            WithValidation.prototype.getErrorCleaner = function (property) {
                return this.cleanPropertyErrors.bind(this, property.name);
            };
            return WithValidation;
        }(React.Component));
    };
}
exports.validate = validate;
//# sourceMappingURL=validate.js.map