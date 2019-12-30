import * as React from "react";
import set = require("lodash.set");
import get = require("lodash.get");

interface Validator {
    fn: (value: any, properties?: any) => boolean;
    error?: string;
}

type PropsGetter = (props: any) => any;

export interface Property {
    name: string;
    value?: any;
    initialValueFromProps?: boolean | PropsGetter;
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
    validateAll: (callback?: () => void) => boolean;
    errorsCount: number;
}

interface PropertyInChildrenProps {
    value: string | boolean;
    errors: string[];
    change: (newValue: any) => void;
    validate: () => boolean;
    cleanErrors: () => void;
}

interface PropertiesInChildrenProps {
    [key: string]:
        | FormValidator
        | PropertyInChildrenProps
        | PropertyInChildrenProps[];
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

    return <OriginalProps extends PossibleProps>(
        BaseComponent:
            | React.ComponentClass<OriginalProps>
            | React.StatelessComponent<OriginalProps>
    ): any => {
        return class WithValidation extends React.Component<
            OriginalProps,
            WithValidationState
        > {
            private synchronousState: WithValidationState = {} as WithValidationState;

            constructor(props: any) {
                super(props);

                this.state = {
                    properties: {}
                };
                this.synchronousState = {
                    properties: {}
                };

                this.setStates = this.setStates.bind(this);
                this.getState = this.getState.bind(this);
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

            private initializeValidatedProperties() {
                const validationProps = {} as {
                    [key: string]:
                        | PropertyInChildrenProps
                        | PropertyInChildrenProps[];
                };

                properties.forEach((prop: Property) => {
                    validationProps[prop.name] = prop.list
                        ? Array.apply(null, Array(prop.length)).map(
                              (x: any, index: number) =>
                                  ({
                                      value: prop.value,
                                      errors: [],
                                      name: `${prop.name}[${index}]`,
                                      validators: prop.validators || [],
                                      fallbackError: prop.error,
                                      external: false
                                  } as PropertyInState)
                          )
                        : ({
                              value: this.getInitialValue(prop),
                              errors: [],
                              name: prop.name,
                              validators: prop.validators || [],
                              fallbackError: prop.error
                          } as PropertyInState);
                });

                this.setStates(() => ({
                    properties: validationProps
                }));
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

                Object.keys(this.getState().properties).forEach(
                    (propertyName: string) => {
                        const property = this.getState().properties[
                            propertyName
                        ];
                        const isList = Array.isArray(property);

                        validationProperties[propertyName] = isList
                            ? property.map((propertyItem: any) => {
                                  errorsCount += propertyItem.errors.length;
                                  return {
                                      value: propertyItem.value,
                                      errors: propertyItem.errors,
                                      change: this.getChanger(propertyItem),
                                      validate: this.getValidator(propertyItem),
                                      cleanErrors: this.getErrorCleaner(
                                          propertyItem
                                      )
                                  };
                              })
                            : {
                                  value: property.value,
                                  errors: property.errors,
                                  change: this.getChanger(property),
                                  validate: this.getValidator(property),
                                  cleanErrors: this.getErrorCleaner(property)
                              };

                        if (!isList) {
                            errorsCount += property.errors.length;
                        }
                    }
                );

                function validateAll(callback?: () => void) {
                    let isAllValid = true;

                    function validateSingle(property: any) {
                        return property.validate();
                    }

                    function traverseProperties(validatedProperties: any) {
                        Object.keys(validatedProperties).forEach(
                            (propertyName: string) => {
                                if (
                                    validatedProperties[propertyName].validate
                                ) {
                                    const isPropertyValid = validateSingle(
                                        validatedProperties[propertyName]
                                    );

                                    if (!isPropertyValid) {
                                        isAllValid = false;
                                    }
                                } else if (
                                    Array.isArray(
                                        validatedProperties[propertyName]
                                    )
                                ) {
                                    traverseProperties(
                                        validatedProperties[propertyName]
                                    );
                                }
                            }
                        );
                    }

                    traverseProperties(validationProperties);

                    if (callback) {
                        this.forceUpdate(callback);
                    }

                    return isAllValid;
                }

                validationProperties.validator = {
                    validateAll: validateAll.bind(this),
                    errorsCount
                };

                return validationProperties;
            }

            private changePropertyValue(propertyPath: string, newValue: any) {
                this.setStates((prevState: any) => {
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
                    let currentPropertyState: PropertyInState;
                    // try to get property by name from state
                    // if there is property with dot in the name
                    // then it should be found
                    // if not found, try to get property by path, using lodash
                    // if there is path to property, then try {} will fail
                    // and property will be obtained by lodash
                    try {
                        currentPropertyState =
                            this.getState().properties[property.name] !==
                            undefined
                                ? this.getState().properties[property.name]
                                : get(
                                      this.getState().properties,
                                      property.name
                                  );
                    } catch (e) {
                        currentPropertyState = get(
                            this.getState().properties,
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
                                this.getState().properties
                            )
                        ) {
                            errors.push(
                                validator.error ||
                                    currentPropertyState.fallbackError
                            );
                        }
                    });

                    this.setStates((prevState: any) => {
                        const newState = { ...prevState };
                        try {
                            newState.properties[property.name].errors = errors;
                        } catch (e) {
                            set(
                                newState.properties,
                                `${property.name}.errors`,
                                errors
                            );
                        }
                        return newState;
                    });

                    return errors.length === 0 ? true : false;
                };
            }

            private getErrorCleaner(property: Property) {
                return this.cleanPropertyErrors.bind(this, property.name);
            }

            private getCurrentPropertyValue(property: PropertyInState) {
                try {
                    return this.getState().properties[property.name].value;
                } catch (e) {
                    return (get(
                        this.getState().properties,
                        property.name
                    ) as PropertyInState).value;
                }
            }
        };
    };
}
