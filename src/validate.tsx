import * as React from "react";
import set = require("lodash.set");
import get = require("lodash.get");

interface Validator {
    fn: (value: any, properties?: any) => boolean;
    error?: string;
}

export interface Property {
    name: string;
    value?: any;
    initialValueFromProps?: boolean;
    list?: boolean;
    length?: number;
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
    validateAll: (callback?: () => void) => void;
}

interface PropertyInChildrenProps {
    value: string | boolean;
    errors: string[];
    change: (newValue: any) => void;
    validate: () => void;
    cleanErrors: () => void;
}

interface PropertiesInChildrenProps {
    [key: string]: FormValidator | PropertyInChildrenProps | PropertyInChildrenProps[];
}

interface PossibleProps {
    [propName: string]: any;
}

interface WithValidationState {
    properties: {
        [key: string]: any;
    };
}

export function validate(properties: Property[]) {
    // todo: validate properties!
    // example: do not allow to set external property with initial value

    return <OriginalProps extends PossibleProps>(BaseComponent: React.ComponentClass<OriginalProps> |
        React.StatelessComponent<OriginalProps>): any => {

        return class WithValidation extends React.Component<OriginalProps, WithValidationState> {
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
                    <BaseComponent
                        {...this.props}
                        {...validatedProperties}
                    />
                );
            }

            private initializeValidatedProperties() {
                const validationProps = {} as {
                    [key: string]: PropertyInChildrenProps | PropertyInChildrenProps[];
                };

                properties.forEach((prop: Property) => {
                    validationProps[prop.name] = prop.list
                        ? Array.apply(null, Array(prop.length)).map((x: any, index: number) => ({
                            value: prop.value,
                            errors: [],
                            name: `${prop.name}[${index}]`,
                            validators: prop.validators,
                            fallbackError: prop.error,
                            external: false
                        } as PropertyInState))
                        : {
                            value: this.getInitialValue(prop),
                            errors: [],
                            name: prop.name,
                            validators: prop.validators,
                            fallbackError: prop.error
                        } as PropertyInState;
                });

                this.setState({
                    properties: validationProps
                });
            }

            private getInitialValue(prop: Property) {
                return prop.initialValueFromProps
                    ? this.getValueFromOriginalProps(prop.name)
                    : prop.value;
            }

            private getValueFromOriginalProps(propName: string) {
                return get(this.props, propName);
            }

            private prepareValidatedPropertiesForChild() {
                const validationProperties: PropertiesInChildrenProps = {};

                Object
                    .keys(this.state.properties)
                    .forEach((propertyName: string) => {
                        const property = this.state.properties[propertyName];
                        validationProperties[propertyName] = Array.isArray(property)
                            ? property.map((propertyItem: any) => ({
                                value: propertyItem.value,
                                errors: propertyItem.errors,
                                change: this.getChanger(propertyItem),
                                validate: this.getValidator(propertyItem),
                                cleanErrors: this.getErrorCleaner(propertyItem)
                            })) : {
                                value: property.value,
                                errors: property.errors,
                                change: this.getChanger(property),
                                validate: this.getValidator(property),
                                cleanErrors: this.getErrorCleaner(property)
                            };
                    });

                function validateAll(callback?: () => void) {
                    function validateSingle(property: any) {
                        property.validate();
                    }

                    function traverseProperties(validatedProperties: any) {
                        Object
                            .keys(validatedProperties)
                            .forEach((propertyName: string) => {
                                if (validatedProperties[propertyName].validate) {
                                    validateSingle(validatedProperties[propertyName]);
                                } else if (Array.isArray(validatedProperties[propertyName])) {
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
            }

            private changePropertyValue(propertyPath: string, newValue: any) {
                this.setState((prevState: any) => {
                    const newState = { ...prevState };
                    try {
                        newState.properties[propertyPath].value = newValue;
                    } catch (e) {
                        set(newState.properties, `${propertyPath}.value`, newValue);
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
                return (newValue: any) => this.changePropertyValue(property.name, newValue);
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
                        currentPropertyState = this.state.properties[property.name] !== undefined
                            ? this.state.properties[property.name]
                            : get(this.state.properties, property.name);
                    } catch (e) {
                        currentPropertyState = get(this.state.properties, property.name);
                    }
                    const errors: string[] = [];

                    property.validators.forEach((validator: Validator) => {
                        if (!validator.fn(
                            this.getCurrentPropertyValue(currentPropertyState),
                            this.state.properties
                        )) {
                            errors.push(validator.error || currentPropertyState.fallbackError);
                        }
                    });

                    if (errors.length) {
                        this.setState((prevState: any) => {
                            const newState = { ...prevState };
                            try {
                                newState.properties[property.name].errors = errors;
                            } catch (e) {
                                set(newState.properties, `${property.name}.errors`, errors);
                            }
                            return newState;
                        });
                    }
                };
            }

            private getErrorCleaner(property: Property) {
                return this.cleanPropertyErrors.bind(this, property.name);
            }

            private getCurrentPropertyValue(property: PropertyInState) {
                try {
                    return this.state.properties[property.name].value;
                } catch (e) {
                    return (get(this.state.properties, property.name) as PropertyInState).value;
                }
            }
        };
    };
}
