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
