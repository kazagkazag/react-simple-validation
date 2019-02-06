import get = require("lodash.get");
import {
    Property,
    PropertyInState,
    PropsGetter,
    ValidateAllResult,
    ValidateAllResultErrors,
    PropertyInChildrenProps,
    PropertiesInChildrenProps
} from "../validate";

export function dynamicValidationProperties(
    propertiesGenerator: (props: any) => Property[],
    props: any
) {
    if (typeof propertiesGenerator !== "function") {
        return [];
    }

    return propertiesGenerator(props);
}

export function toValidatedProperties(properties: Property[], props: any) {
    const validationProps = {} as {
        [key: string]: PropertyInState;
    };

    [...properties].forEach((prop: Property) => {
        validationProps[prop.name] = {
            value: getInitialValue(prop, props),
            errors: [],
            name: prop.name,
            validators: prop.validators || [],
            fallbackError: prop.error
        } as PropertyInState;
    });

    return validationProps;
}

export function createValidateAll(
    validationProperties: PropertiesInChildrenProps,
    updater: (callback: () => void) => void
) {
    return function validateAll(
        callback?: (result: ValidateAllResult) => void
    ): ValidateAllResult {
        let isAllValid = true;
        const allErrors: ValidateAllResultErrors = {};

        function validateSingle(property: any) {
            return property.validate();
        }

        Object.keys(validationProperties).forEach((propertyName: string) => {
            if (
                (validationProperties[propertyName] as PropertyInChildrenProps)
                    .validate
            ) {
                const { isValid, errors } = validateSingle(
                    validationProperties[propertyName]
                );

                if (!isValid) {
                    isAllValid = false;
                    allErrors[propertyName] = errors;
                }
            }
        });

        const validateAllResult: ValidateAllResult = {
            isValid: isAllValid,
            errors: isAllValid ? null : allErrors
        };

        if (callback) {
            updater(() => callback(validateAllResult));
        }

        return validateAllResult;
    };
}

function getInitialValue(prop: Property, props: any) {
    const getInitialValueFromPropsBasedOnName =
        prop.initialValueFromProps === true;

    if (getInitialValueFromPropsBasedOnName) {
        return getValueFromOriginalPropsByName(prop.name, props);
    }

    const getInitialValueFromPropsUsingFunction =
        typeof prop.initialValueFromProps === "function";

    if (getInitialValueFromPropsUsingFunction) {
        return getValueFromOriginalPropsUsingFn(
            prop.initialValueFromProps as PropsGetter,
            props
        );
    }

    return prop.value === undefined ? "" : prop.value;
}

export function getValueFromOriginalPropsByName(propName: string, props: any) {
    return get(props, propName);
}

export function getValueFromOriginalPropsUsingFn(
    getter: PropsGetter,
    props: any
): any {
    return getter(props);
}
