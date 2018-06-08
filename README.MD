# IN PROGRESS....

# Introduction

With `React simple validation` you can speed up form creation with react
and typescript.

# Installation

`npm install --save-dev react-simple-validation`

There is no need to install types, because they are provided with the package.

# Usage

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
    name: "email", // proprety name, it will be exposed in props
    value: "", // initial value
    validators: [{ // list of validators...
        fn: (value: any) => !!value.trim(), // validator, if return false - field is invalid
        error: "Email is empty." // error message for that specific validator
    }, {
        fn: (value: any) => value.indexOf("@") >= 0
    }],
    error: "Fallback error for validator without own error." // error message used if validator hasn't own error message defined
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
                        // all properties validated
                        // we can read errors from props and proceed
                    });
                }}
            >
                // every property defined in @validate() will be exposed
                // in component props, so we have access
                // to it's current value, list of errors and methods
                // for changing value and clear all errors
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

## validate(options: ValidationOptions)

## ValidationOptions

### name: string;
The name of the validated property. Props with that name will be exposed on decorated component (structure of that props is described below in "..." section).

### value: string|boolean
Initial value of the property. If property is a list, then all items in the list will have that value.

### initialValueFromProps?: boolean
If you have to provide initial value from props (for example: from redux store), then you should specify `initialValueFromProps: true`. Value of prop with name specified in `name` property will be used as initial value.

### list?: boolean;
If true, then property will be a list.

### length?: number;
If property is a list, then you have to provide length of the list.

### validators: Validator[];
Array of validators. See `Validator` section for more details. In validation stage
every validator will be fired and if it return `false` then `error` will be save in errors list.

### error?: string;
Fallback error message. If some validator doesn't have own error message, then that message will be used.

## Validator

### fn: (value: any) => boolean
Function fired during the validation stage. It takes value of the proerties and returns `false` if property is invalid.

### error?: string;
Error that will be saved in errors list of the property passed to the decorated component, if related validator return `false`.

## PropertyWithValidation
Property passed from HOC to decorated component has following shape:

### value: any;
Value of the property.

### errors: string[];
List of errors returned from last validation.

### change: (value: any) => void;
Callback for changing value of the property. You can also change value using redux or any other custom solution and pass only a value to validation. For that you have to use `initialValueFromProps` option.

### validate: () => void;
Method that will fire validation of that property.

### cleanErrors: () => void;
Method to clean all errors from last validation. Useful when you want to clear `error state` of the form input after focus/change event.

# TODO

- [ ] Add errors count to `validator` prop
- [ ] Handle value from external source
- [ ] Accept error message as a function and pass props and value to it
- [ ] Accept initial value as a function and pass props to it (done, waiting for npm release)