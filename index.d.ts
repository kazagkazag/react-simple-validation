// Type definitions for React Simple Validation
// Project: React Simple Validation
// Definitions by: Kamil Zagrabski

interface ValidateAllResultErrors {
    [propertyName: string]: string[];
}

export interface ValidateAllResult {
    isValid: boolean;
    errors?: ValidateAllResultErrors;
}

interface PropertyValidator {
    fn: (value: any, properties?: any) => boolean;
    error?: string;
}

type PropsGetter = (props: any) => any;

export interface Property {
    name: string;
    value?: any;
    initialValueFromProps?: boolean | PropsGetter;
    syncValue?: boolean | PropsGetter;
    validators?: PropertyValidator[];
    error?: string;
}

export function validate(
    properties: Property[],
    propertiesGenerator?: PropertiesGenerator
): <OriginalProps extends {}>(BaseComponent: any) => any;

export interface PropertyWithValidation {
    value: any;
    errors: string[];
    change: (value: any) => void;
    validate: () => boolean;
    cleanErrors: () => void;
}

export interface Validator {
    errorsCount: number;
    validateAll(callback?: (results:  ValidateAllResult) => void): ValidateAllResult;
}

type PropertiesGenerator = (props: any) => Property[];
