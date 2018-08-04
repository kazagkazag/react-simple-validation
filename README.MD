# IN PROGRESS....

# Introduction

With `React simple validation` you can speed up form creation with react
and typescript.

The idea is simple. Your component wrapped in `validate` HOC will receive
prop for every validated entity. That prop will have few properties (see below).
Thanks to them you will be able to display and change value of entity, validate it,
display and clear errors.
That's all. Now you should handle value and errors in your component. You can use
any components you wan't, it is up to you.

# Installation

`npm install --save-dev react-simple-validation`

There is no need to install types, because they are provided with the package.

# Example

## Simple newsletter form

Below you will see how to handle simple newsletter form with `rsv`. The form
is simplified, so there is no unrelated properties and elements (like `name` or
`<label>`).

```typescript
// all other imports ...
// import HOC and Property interface:
import {validate, PropertyWithValidation} from "react-simple-validation";

// define interface for all properties and global validator:
interface NewsletterFormProps {
    email: PropertyWithValidation;
    agreement: PropertyWithValidation;
    validator: any;
}

// use HOC as decorator
@validate([{
    // proprety name, it will be exposed in props
    name: "email",
    // initial value, empty string in that case
    value: "", 
    // list of validators
    validators: [{ 
        // validator function, if return false - field is invalid and error message will be stored in `errors` property
        fn: (value: any) => !!value.trim(), 
        // error message for that specific validator
        error: "Email is empty." 
    }, {
        fn: (value: any) => value.indexOf("@") >= 0
    }],
    // fallback error message (second validator doesn't have own message, so it will use that one)
    error: "Fallback error for validator without own error."
}, {
    name: "agreement",
    value: false,
    validators: [{
        fn: (value: any) => !!value,
        error: "Agreement is required."
    }]
}])
class NewsletterForm extends React.Component<NewsletterFormProps, any> {
    public render() {
        return (
            <form 
                onSumbit={() => {
                    props.validator.validateAll(() => {
                        // all properties are validated
                        // we can read errors from props and proceed
                    });
                }}
            >
                // every property defined in @validate() will be exposed
                // in component props, so we have access
                // to it's current value, list of errors and methods
                // for changing value, clear all errors and validate that
                // specific prop
                <input
                    type="text"
                    value={props.email.value}
                    onChange={(e) => props.email.change(e.target.value)}
                    onFocus={props.email.clearErrors}
                />
                <p>{props.email.errors}</p>

                <input
                    type="checkbox"
                    value={props.agreement.value}
                    onChange={() => {
                        props.agreement.change(!props.agreement.value)
                    }}
                    onFocus={props.agreement.clearErrors}
                />
                I agree!
                <p>{props.agreement.errors}</p>

                <button type="sumbit">Sign in</button>
            </form>
        )
    }
}
```

# API

## `validate(options: ValidationOptions)`

Higher Order Function that returns component with additional props. For every property defined in [ValidationOptions](#validationoptions) your component will receive prop with the same name with shape described by [PropertyWithValidation](#propertywithvalidation).

# Interfaces

## `ValidationOptions`

#### `name: string`
The name of the validated property. Props with that name will be exposed on decorated component (structure of that props is described below in [PropertyWithValidation](#propertywithvalidation)).

#### `value: string|boolean`
Initial value of the property. If property is a list, then all items in the list will have that value. If not provided, then
empty string will be used as default.

#### `initialValueFromProps?: boolean | (props: any) => any`
If you have to provide initial value from props (for example: from redux store), then you should specify `initialValueFromProps: true`. If `true` - value of prop with name specified in `name` property will be used as initial value.
If `function` provided, then function will be used to get value from all component props.

#### `list?: boolean`
If true, then property will be a list.

#### `length?: number`
If property is a list, then you have to provide length of the list.

#### `validators: Validator[]`
Array of validators. See [Validator](#validator) for more details. In validation stage
every validator will be fired and if it return `false` then `error` will be save in errors list.

#### `error?: string`
Fallback error message. If some validator doesn't have own error message, then that message will be used.

## Validator

#### `fn: (value: any, properties: {[key: string]: SinglePropertyWithValidation}) => boolean`
Function fired during the validation stage. It takes value of the validated property and all other properties and returns `false` if property is invalid.

#### `error?: string`
Error that will be saved in errors list of the property passed to the decorated component, if related validator return `false`.

## PropertyWithValidation = SinglePropertyWithValidation | SharedValidator

## SinglePropertyWithValidation

#### `value: any`
Value of the property.

#### `errors: string[]`
List of errors returned from last validation.

#### `change: (value: any) => void`
Callback for changing value of the property. You can also change value using redux or any other custom solution and pass only a value to validation. For that you have to use `initialValueFromProps` option.

#### `validate: () => boolean`
Method that will fire validation of that property. Returns `true` if valid.

#### `cleanErrors: () => void`
Method to clean all errors from last validation. Useful when you want to clear `error state` of the form input after focus/change event.

## SharedValidator

Moreover your component will receive `validator` prop with following properies:

#### `validateAll: (callback?: (errors?: {[key: string]: string[]}) => void) => boolean`
Method to validate all properties. You can pass callback in which you will be able to read all errors from properties
and react to the result of validation.
Returns `true` if all properties are valid.

#### `errorCount: number`
Total number of errors for all properties.

# TODO

- [x] Add errors count to `validator` prop
- [ ] Handle value from external source
- [ ] Accept error message as a function and pass props and value to it
- [x] Accept initial value as a function and pass props to it