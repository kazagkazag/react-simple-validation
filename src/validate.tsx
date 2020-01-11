import * as React from "react";
import set = require("lodash.set");
import get = require("lodash.get");
import {
    dynamicValidationProperties,
    toValidatedProperties,
    createValidateAll,
    getValueFromOriginalPropsByName,
    getValueFromOriginalPropsUsingFn
} from "./validatedProperties/validatedProperties";

export interface ValidateAllResultErrors {
    [propertyName: string]: string[];
}

export interface ValidateAllResult {
    isValid: boolean;
    errors?: ValidateAllResultErrors;
}

interface Validator {
    fn: (value: any, properties?: any) => boolean;
    error?: string;
}

export type PropsGetter = (props: any) => any;

export interface Property {
    name: string;
    value?: any;
    initialValueFromProps?: boolean | PropsGetter;
    syncValue?: boolean | PropsGetter;
    validators: Validator[];
    error?: string;
}

export interface PropertyInState {
    name: string;
    value: any;
    errors: string[];
    validators: Validator[];
    fallbackError?: string;
    external: boolean;
}

interface FormValidator {
    errorsCount: number;
    validateAll(
        callback?: (results: ValidateAllResult) => void
    ): ValidateAllResult;
}

export interface PropertyInChildrenProps {
    value: string | boolean;
    errors: string[];
    change: (newValue: any) => void;
    validate: () => { isValid: boolean; errors: string[] };
    cleanErrors: () => void;
}

export interface PropertiesInChildrenProps {
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

type PropertiesGenerator = (props: PossibleProps) => Property[];

export function validate(
    properties: Property[],
    propertiesGenerator?: PropertiesGenerator
) {
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
            private computedProperties: Property[] = [];
            private synchronousState: WithValidationState = {} as WithValidationState;

            constructor(props: any) {
                super(props);

                const initliazedProps = this.initializeValidatedProperties();

                this.state = {
                    properties: initliazedProps
                };
                this.synchronousState = {
                    properties: initliazedProps
                };

                this.setStates = this.setStates.bind(this);
                this.getState = this.getState.bind(this);
            }

            public componentDidUpdate(oldProps: OriginalProps) {
                this.syncValues(oldProps);
            }

            public render() {
                const validatedProperties = this.prepareValidatedPropertiesForChild();

                return (
                    <BaseComponent {...this.props} {...validatedProperties} />
                );
            }

            private setStates(
                updater: (
                    prevState: WithValidationState,
                    props?: OriginalProps
                ) => WithValidationState,
                callback?: () => any
            ) {
                this.synchronousState = updater(this.synchronousState);
                this.setState(updater, callback);
            }

            private getState() {
                return this.synchronousState;
            }

            private syncValues(oldProps: OriginalProps) {
                const propertiesToChange: Array<[string, any]> = [];

                this.computedProperties.forEach((p: Property) => {
                    if (!p.syncValue) {
                        return;
                    }

                    let oldValue;
                    let newValue;

                    if (typeof p.syncValue === "boolean") {
                        oldValue = getValueFromOriginalPropsByName(
                            p.name,
                            oldProps
                        );
                        newValue = getValueFromOriginalPropsByName(
                            p.name,
                            this.props
                        );
                    }

                    if (typeof p.syncValue === "function") {
                        oldValue = getValueFromOriginalPropsUsingFn(
                            p.syncValue,
                            oldProps
                        );
                        newValue = getValueFromOriginalPropsUsingFn(
                            p.syncValue,
                            this.props
                        );
                    }

                    if (oldValue === newValue) {
                        return;
                    }

                    propertiesToChange.push([p.name, newValue]);
                });

                if (propertiesToChange.length) {
                    this.changePropertiesValues(propertiesToChange);
                }
            }

            private initializeValidatedProperties() {
                this.computedProperties = [
                    ...properties,
                    ...dynamicValidationProperties(
                        propertiesGenerator,
                        this.props
                    )
                ];

                return toValidatedProperties(
                    this.computedProperties,
                    this.props
                );
            }

            private prepareValidatedPropertiesForChild() {
                const propertiesForChild: PropertiesInChildrenProps = {};
                let errorsCount = 0;

                Object.keys(this.getState().properties).forEach(
                    (propertyName: string) => {
                        const property = this.getState().properties[
                            propertyName
                        ];

                        propertiesForChild[propertyName] = {
                            value: property.value,
                            errors: property.errors,
                            change: this.getChanger(property),
                            validate: this.getValidator(property),
                            cleanErrors: this.getErrorCleaner(property)
                        };

                        errorsCount += property.errors.length;
                    }
                );

                propertiesForChild.validator = {
                    validateAll: createValidateAll(
                        propertiesForChild,
                        this.forceUpdate.bind(this)
                    ),
                    errorsCount
                };

                return propertiesForChild;
            }

            private changePropertiesValues(
                propsToChange: Array<[string, any]>
            ) {
                this.setStates((prevState: any) => {
                    const newState = { ...prevState };
                    propsToChange.forEach(([path, value]) => {
                        set(newState.properties, `${path}.value`, value);
                    });
                    return newState;
                });
            }

            private changePropertyValue(propertyPath: string, newValue: any) {
                this.setStates((prevState: any) => {
                    const newState = { ...prevState };
                    set(newState.properties, `${propertyPath}.value`, newValue);
                    return newState;
                });
            }

            private cleanPropertyErrors(propertyPath: string) {
                this.setStates((prevState: any) => {
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
                    const currentPropertyState: PropertyInState = get(
                        this.getState().properties,
                        property.name
                    );
                    const errors: string[] = [];

                    property.validators.forEach((validator: Validator) => {
                        if (
                            !validator.fn(
                                this.getCurrentPropertyValue(
                                    currentPropertyState
                                ),
                                this.getState().properties
                            )
                        ) {
                            errors.push(
                                validator.error ||
                                    currentPropertyState.fallbackError
                            );
                        }
                    });

                    let afterValidationErrors: string[] = null;

                    const newState = { ...this.state };
                    set(newState.properties, `${property.name}.errors`, errors);

                    if (
                        ((get(
                            newState.properties,
                            `${property.name}.errors`
                        ) as unknown) as string[]).length
                    ) {
                        afterValidationErrors = (get(
                            newState.properties,
                            `${property.name}.errors`
                        ) as unknown) as string[];
                    }

                    this.setStates(() => newState);

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
                return (get(
                    this.getState().properties,
                    property.name
                ) as PropertyInState).value;
            }
        };
    };
}
