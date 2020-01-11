"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var get = require("lodash.get");
function dynamicValidationProperties(propertiesGenerator, props) {
    if (typeof propertiesGenerator !== "function") {
        return [];
    }
    return propertiesGenerator(props);
}
exports.dynamicValidationProperties = dynamicValidationProperties;
function toValidatedProperties(properties, props) {
    var validationProps = {};
    __spreadArrays(properties).forEach(function (prop) {
        validationProps[prop.name] = {
            value: getInitialValue(prop, props),
            errors: [],
            name: prop.name,
            validators: prop.validators || [],
            fallbackError: prop.error
        };
    });
    return validationProps;
}
exports.toValidatedProperties = toValidatedProperties;
function createValidateAll(validationProperties, updater) {
    return function validateAll(callback) {
        var isAllValid = true;
        var allErrors = {};
        function validateSingle(property) {
            return property.validate();
        }
        Object.keys(validationProperties).forEach(function (propertyName) {
            if (validationProperties[propertyName]
                .validate) {
                var _a = validateSingle(validationProperties[propertyName]), isValid = _a.isValid, errors = _a.errors;
                if (!isValid) {
                    isAllValid = false;
                    allErrors[propertyName] = errors;
                }
            }
        });
        var validateAllResult = {
            isValid: isAllValid,
            errors: isAllValid ? null : allErrors
        };
        if (callback) {
            updater(function () { return callback(validateAllResult); });
        }
        return validateAllResult;
    };
}
exports.createValidateAll = createValidateAll;
function getInitialValue(prop, props) {
    var getInitialValueFromPropsBasedOnName = prop.initialValueFromProps === true;
    if (getInitialValueFromPropsBasedOnName) {
        return getValueFromOriginalPropsByName(prop.name, props);
    }
    var getInitialValueFromPropsUsingFunction = typeof prop.initialValueFromProps === "function";
    if (getInitialValueFromPropsUsingFunction) {
        return getValueFromOriginalPropsUsingFn(prop.initialValueFromProps, props);
    }
    return prop.value === undefined ? "" : prop.value;
}
function getValueFromOriginalPropsByName(propName, props) {
    return get(props, propName);
}
exports.getValueFromOriginalPropsByName = getValueFromOriginalPropsByName;
function getValueFromOriginalPropsUsingFn(getter, props) {
    return getter(props);
}
exports.getValueFromOriginalPropsUsingFn = getValueFromOriginalPropsUsingFn;
//# sourceMappingURL=validatedProperties.js.map