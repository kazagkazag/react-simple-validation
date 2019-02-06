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
var validatedProperties_1 = require("./validatedProperties/validatedProperties");
function validate(properties, propertiesGenerator) {
    // todo: validate properties!
    // example: do not allow to set external property with initial value
    return function (BaseComponent) {
        return /** @class */ (function (_super) {
            __extends(WithValidation, _super);
            function WithValidation(props) {
                var _this = _super.call(this, props) || this;
                _this.state = {
                    properties: _this.initializeValidatedProperties()
                };
                return _this;
            }
            WithValidation.prototype.render = function () {
                var validatedProperties = this.prepareValidatedPropertiesForChild();
                return (React.createElement(BaseComponent, __assign({}, this.props, validatedProperties)));
            };
            WithValidation.prototype.initializeValidatedProperties = function () {
                return validatedProperties_1.toValidatedProperties(properties.concat(validatedProperties_1.dynamicValidationProperties(propertiesGenerator, this.props)), this.props);
            };
            WithValidation.prototype.prepareValidatedPropertiesForChild = function () {
                var _this = this;
                var propertiesForChild = {};
                var errorsCount = 0;
                Object.keys(this.state.properties).forEach(function (propertyName) {
                    var property = _this.state.properties[propertyName];
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
                    var currentPropertyState = get(_this.state.properties, property.name);
                    var errors = [];
                    property.validators.forEach(function (validator) {
                        if (!validator.fn(_this.getCurrentPropertyValue(currentPropertyState), _this.state.properties)) {
                            errors.push(validator.error ||
                                currentPropertyState.fallbackError);
                        }
                    });
                    var afterValidationErrors = null;
                    if (errors.length) {
                        var newState = __assign({}, _this.state);
                        set(newState.properties, property.name + ".errors", errors);
                        if (get(newState.properties, property.name + ".errors").length) {
                            afterValidationErrors = get(newState.properties, property.name + ".errors");
                        }
                        _this.setState(newState);
                    }
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
                return get(this.state.properties, property.name).value;
            };
            return WithValidation;
        }(React.Component));
    };
}
exports.validate = validate;
//# sourceMappingURL=validate.js.map