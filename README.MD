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

import {validate, PropertyWithValidation} from "react-simple-validation";

interface NewsletterFormProps {
    email: PropertyWithValidation;
    agreement: PropertyWithValidation;
    validator: any;
}

@validate([{
    name: "email",
    value: "",
    validators: [{
        fn: (value: any) => !!value.trim(),
        error: "Email is empty."
    }, {
        fn: (value: any) => value.indexOf("@") >= 0
    }],
    error: "Fallback error for validator without own error."
}, {
    name: "agreement",
    value: false,
    validators: [{
        fn: (value: any) => !!value,
        error: "Agreement is required."
    }]
}])
const NewsletterForm: React.SFC<NewsletterFormProps> = (props: NewsletterFormProps) => {
    return (
        <form 
            onSumbit={() => {
                props.validator.validateAll(() => {
                    // all properties validated
                    // we can read errors from props and proceed
                });
            }}
        >
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
```

# API
