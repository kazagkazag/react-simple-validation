import * as React from "react";
import set = require("lodash.set");
import get = require("lodash.get");

interface Validator {
    fn: (value: any, properties?: any) => boolean;
    error?: string;
}

interface Property {
    name: string;
    value?: any;
    list?: boolean;
    length?: number;
    validators: Validator[];
    error?: string;
    external?: boolean;
    changeHandlerName?: string;
}

interface PropertyInState {
    name: string;
    value: any;
    errors: string[];
    validators: Validator[];
    fallbackError?: string;
    external: boolean;
    changeHandlerName?: string;
}

interface PropertiesInChildrenProps {
    [key: string]: any;
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
                    [key: string]: any;
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
                            fallbackError: prop.error,
                            external: prop.external,
                            changeHandlerName: prop.changeHandlerName
                        } as PropertyInState;
                });

                this.setState({
                    properties: validationProps
                });
            }

            private getInitialValue(prop: Property) {
                return prop.external
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
                                value: property.external
                                    ? this.getValueFromOriginalProps(property.name)
                                    : property.value,
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
                    set(newState.properties, `${propertyPath}.value`, newValue);
                    return newState;
                });
            }

            private cleanPropertyErrors(propertyPath: string) {
                this.setState((prevState: any) => {
                    const newState = { ...prevState };
                    set(newState.properties, `${propertyPath}.errors`, []);
                    return newState;
                });
            }

            private getChanger(property: PropertyInState) {
                return property.external
                    ? this.getChangerForExternalProperty(property)
                    : (newValue: any) => this.changePropertyValue(property.name, newValue);
            }

            private getChangerForExternalProperty(property: PropertyInState) {
                const changer = get(this.props, property.changeHandlerName);

                if (!changer || typeof changer !== "function") {
                    throw Error(
                        "Changer function for external property not found or it is not a function."
                        + "If you want to use external properties, you should specify"
                        + "name of the 'changeHandlerName' which should be a function and accept one"
                        + "argument: value after change."
                    )
                } else {
                    return (value: any) => changer(value);
                }
            }

            private getValidator(property: Property) {
                return () => {
                    const currentPropertyState: PropertyInState = get(this.state.properties, property.name);
                    const errors: string[] = [];

                    property.validators.forEach((validator: Validator) => {
                        if (!validator.fn(currentPropertyState.value, this.state.properties)) {
                            errors.push(validator.error || currentPropertyState.fallbackError);
                        }
                    });

                    if (errors.length) {
                        this.setState((prevState: any) => {
                            const newState = { ...prevState };
                            set(newState.properties, `${property.name}.errors`, errors);
                            return newState;
                        });
                    }
                };
            }

            private getErrorCleaner(property: Property) {
                return this.cleanPropertyErrors.bind(this, property.name);
            }
        };
    };
}
