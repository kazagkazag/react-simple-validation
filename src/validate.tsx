import * as React from "react";
import set = require("lodash.set");
import get = require("lodash.get");

interface Validator {
    fn: (value: any, properties?: any) => boolean;
    error?: string;
}

export interface ValidateAllResult {
    isValid: boolean;
    errors?: ValidateAllResultErrors;
}

interface ValidateAllResultErrors {
    [propertyName: string]: string;
}

type PropsGetter = (props: any) => any;

export interface Property {
    name: string;
    value?: any;
    initialValueFromProps?: boolean | PropsGetter;
    validators: Validator[];
    error?: string;
}

interface PropertyInState {
    name: string;
    value: any;
    errors: string[];
    validators: Validator[];
    fallbackError?: string;
    external: boolean;
}

interface FormValidator {
    validateAll: (callback?: () => void) => boolean;
    errorsCount: number;
}

interface PropertyInChildrenProps {
    value: string | boolean;
    errors: string[];
    change: (newValue: any) => void;
    validate: () => { isValid: boolean; errors: string[] };
    cleanErrors: () => void;
}

interface PropertiesInChildrenProps {
    [key: string]: FormValidator | PropertyInChildrenProps;
}

interface PossibleProps {
    [propName: string]: any;
}

interface WithValidationState {
    properties: {
        [key: string]: PropertyInState;
    };
}

export function validate(properties: Property[]) {
    // todo: validate properties!
    // example: do not allow to set external property with initial value

    return <OriginalProps extends PossibleProps>(
        BaseComponent:
            | React.ComponentClass<OriginalProps>
            | React.StatelessComponent<OriginalProps>
    ): any => {
        return class WithValidation extends React.Component<
            OriginalProps,
            WithValidationState
        > {
            constructor(props: any) {
                super(props);

                this.state = {
                    properties: {}
                };
            }

            public componentDidMount() {
                this.initializeValidatedProperties();
            }

            public render() {
                const validatedProperties = this.prepareValidatedPropertiesForChild();

                return (
                    <BaseComponent {...this.props} {...validatedProperties} />
                );
            }

            private initializeValidatedProperties() {
                const validationProps = {} as {
                    [key: string]: PropertyInState;
                };

                properties.forEach((prop: Property) => {
                    validationProps[prop.name] = {
                        value: this.getInitialValue(prop),
                        errors: [],
                        name: prop.name,
                        validators: prop.validators || [],
                        fallbackError: prop.error
                    } as PropertyInState;
                });

                this.setState({
                    properties: validationProps
                });
            }

            private getInitialValue(prop: Property) {
                const getInitialValueFromPropsBasedOnName =
                    prop.initialValueFromProps === true;

                if (getInitialValueFromPropsBasedOnName) {
                    return this.getValueFromOriginalPropsByName(prop.name);
                }

                const getInitialValueFromPropsUsingFunction =
                    typeof prop.initialValueFromProps === "function";

                if (getInitialValueFromPropsUsingFunction) {
                    return this.getValueFromOriginalPropsUsingFn(
                        prop.initialValueFromProps as PropsGetter
                    );
                }

                return prop.value === undefined ? "" : prop.value;
            }

            private getValueFromOriginalPropsByName(propName: string) {
                return get(this.props, propName);
            }

            private getValueFromOriginalPropsUsingFn(getter: PropsGetter): any {
                return getter(this.props);
            }

            private prepareValidatedPropertiesForChild() {
                const validationProperties: PropertiesInChildrenProps = {};
                let errorsCount = 0;

                Object.keys(this.state.properties).forEach(
                    (propertyName: string) => {
                        const property = this.state.properties[propertyName];

                        validationProperties[propertyName] = {
                            value: property.value,
                            errors: property.errors,
                            change: this.getChanger(property),
                            validate: this.getValidator(property),
                            cleanErrors: this.getErrorCleaner(property)
                        };

                        errorsCount += property.errors.length;
                    }
                );

                function validateAll(
                    callback?: (result: { isValid: boolean, errors: any }) => void
                ) {
                    let isAllValid = true;
                    const allErrors = {} as { [key: string]: string[] };

                    function validateSingle(property: any) {
                        return property.validate();
                    }

                    Object.keys(validationProperties).forEach(
                        (propertyName: string) => {
                            if (
                                (validationProperties[
                                    propertyName
                                ] as PropertyInChildrenProps).validate
                            ) {
                                const { isValid, errors } = validateSingle(
                                    validationProperties[propertyName]
                                );

                                if (!isValid) {
                                    isAllValid = false;
                                    allErrors[propertyName] = errors;
                                }
                            }
                        }
                    );

                    const validateAllResult = {
                        isValid: isAllValid,
                        errors: isAllValid ? null : allErrors
                    };

                    if (callback) {
                        this.forceUpdate(() => callback(validateAllResult));
                    }

                    return validateAllResult;
                }

                validationProperties.validator = {
                    validateAll: validateAll.bind(this),
                    errorsCount
                };

                return validationProperties;
            }

            private changePropertyValue(propertyPath: string, newValue: any) {
                this.setState((prevState: any) => {
                    const newState = { ...prevState };
                    try {
                        newState.properties[propertyPath].value = newValue;
                    } catch (e) {
                        set(
                            newState.properties,
                            `${propertyPath}.value`,
                            newValue
                        );
                    }
                    return newState;
                });
            }

            private cleanPropertyErrors(propertyPath: string) {
                this.setState((prevState: any) => {
                    const newState = { ...prevState };
                    try {
                        newState.properties[propertyPath].errors = [];
                    } catch (e) {
                        set(newState.properties, `${propertyPath}.errors`, []);
                    }
                    return newState;
                });
            }

            private getChanger(property: PropertyInState) {
                return (newValue: any) =>
                    this.changePropertyValue(property.name, newValue);
            }

            private getValidator(property: Property) {
                return () => {
                    let currentPropertyState: PropertyInState;
                    // try to get property by name from state
                    // if there is property with dot in the name
                    // then it should be found
                    // if not found, try to get property by path, using lodash
                    // if there is path to property, then try {} will fail
                    // and property will be obtained by lodash
                    try {
                        currentPropertyState =
                            this.state.properties[property.name] !== undefined
                                ? this.state.properties[property.name]
                                : get(this.state.properties, property.name);
                    } catch (e) {
                        currentPropertyState = get(
                            this.state.properties,
                            property.name
                        );
                    }
                    const errors: string[] = [];

                    property.validators.forEach((validator: Validator) => {
                        if (
                            !validator.fn(
                                this.getCurrentPropertyValue(
                                    currentPropertyState
                                ),
                                this.state.properties
                            )
                        ) {
                            errors.push(
                                validator.error ||
                                    currentPropertyState.fallbackError
                            );
                        }
                    });

                    let afterValidationErrors: string[] = null;

                    if (errors.length) {
                        const newState = { ...this.state };
                        try {
                            newState.properties[property.name].errors = errors;
                        } catch (e) {
                            set(
                                newState.properties,
                                `${property.name}.errors`,
                                errors
                            );
                        }

                        if (
                            (get(
                                newState.properties,
                                `${property.name}.errors`
                            ) as string[]).length
                        ) {
                            afterValidationErrors = get(
                                newState.properties,
                                `${property.name}.errors`
                            );
                        }

                        this.setState(newState);
                    }

                    return {
                        isValid: afterValidationErrors === null,
                        errors: afterValidationErrors
                    };
                };
            }

            private getErrorCleaner(property: Property) {
                return this.cleanPropertyErrors.bind(this, property.name);
            }

            private getCurrentPropertyValue(property: PropertyInState) {
                try {
                    return this.state.properties[property.name].value;
                } catch (e) {
                    return (get(
                        this.state.properties,
                        property.name
                    ) as PropertyInState).value;
                }
            }
        };
    };
}
