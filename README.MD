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

Below you will see how to handle simple newsletter form with `rsv`. Working code here: [React Simple Validation on CodeSandbox](https://codesandbox.io/s/w76v2vkr55).

#### index.tsx

```typescript
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

ReactDOM.render(
  <App
    user={{ age: 18 }}
    note="Some note from props"
    agreements={[
      {
        name: "emailContact"
      },
      {
        name: "phoneContact"
      }
    ]}
  />,
  document.getElementById("root")
);

```

#### App.tsx

```typescript
import React, { Component } from "react";
import {
  validate,
  PropertyWithValidation,
  Validator
} from "react-simple-validation";

// declare props which will be passed from 'validate' HOC as PropertyWithValidation
interface AppProps {
  // note 'user' prop, it will be used for 'age' field
  user: { age: number };
  name: PropertyWithValidation;
  age: PropertyWithValidation;
  role: PropertyWithValidation;
  newsletter: PropertyWithValidation;
  gender: PropertyWithValidation;
  // 'note' is a string at first, but after initial mount it will be PropertyWithValidation
  note: PropertyWithValidation | string;
  validator: Validator;
  // 'agreements' will be used to dynamically generated fields
  agreements: Array<{
    name: string;
  }>;
}

class App extends Component<AppProps, {}> {
  render() {
    // destructure prop created by 'validate' HOC
    const {
      name,
      age,
      role,
      newsletter,
      gender,
      note,
      emailContact,
      phoneContact
    } = this.props;
    
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          this.tryToSubmit();
        }}
      >
        <div>
          <label htmlFor="name">Name:</label>
          {/* 
            Every prop created by 'validate' HOC has:
            'value', 'errors', 'change' callback and 'cleanErrors' callback.
            Use it wherever you want.
          */}
          <input
            type="text"
            id="name"
            value={name.value}
            onChange={e => name.change(e.target.value)}
            onBlur={name.cleanErrors}
          />
          <p>{name.errors}</p>
        </div>
        <div>
          <label htmlFor="age">Age:</label>
          <input
            type="number"
            id="age"
            value={age.value}
            onChange={e => age.change(e.target.value)}
            onBlur={age.cleanErrors}
          />
          <p>{age.errors}</p>
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            value={role.value}
            onChange={e => role.change(e.target.value)}
            onBlur={role.cleanErrors}
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <p>{role.errors}</p>
        </div>
        <div>
          <input
            type="checkbox"
            id="newsletter"
            value={newsletter.value}
            onChange={e => newsletter.change(e.target.checked)}
            onBlur={newsletter.cleanErrors}
          />
          <label htmlFor="newsletter">Sign up for newsletter</label>
          <p>{newsletter.errors}</p>
        </div>
        <div>
          <input
            type="radio"
            name="gender"
            id="male"
            value={gender.value}
            onChange={() => gender.change("male")}
            onBlur={gender.cleanErrors}
          />
          <label htmlFor="male">Male</label>
          <input
            type="radio"
            name="gender"
            id="female"
            value={gender.value}
            onChange={() => gender.change("female")}
            onBlur={gender.cleanErrors}
          />
          <label htmlFor="female">Female</label>
        </div>
        <div>
          <label htmlFor="userNote">Note:</label>
          <textarea
            id="userNote"
            value={(note as PropertyWithValidation).value}
            onChange={e =>
              (note as PropertyWithValidation).change(e.target.value)
            }
            onBlur={(note as PropertyWithValidation).cleanErrors}
          />
        </div>
        {/* 
          'emailContact' and 'phoneContact' were generated based on agreements
          passed to the App from index.tsx.
        */}
        <div>
          <input
            type="checkbox"
            id="emailContact"
            value={emailContact.value}
            onChange={e => emailContact.change(e.target.checked)}
            onBlur={emailContact.cleanErrors}
          />
          <label htmlFor="emailContact">Agree on email contact.</label>
          <p>{emailContact.errors}</p>
        </div>
        <div>
          <input
            type="checkbox"
            id="phoneContact"
            value={phoneContact.value}
            onChange={e => phoneContact.change(e.target.checked)}
            onBlur={phoneContact.cleanErrors}
          />
          <label htmlFor="phoneContact">Agree on phone contact.</label>
          <p>{phoneContact.errors}</p>
        </div>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    );
  }

  private tryToSubmit() {
    // Call 'validateAll' from 'validator' prop (passed by 'validate' HOC)
    // and checkout 'isValid' flag. It there are some errors they will be
    // in 'errors' object.
    // You can use also 'async' callback, it will be called in next life cycle
    // of the App component.
    const { isValid, errors } = this.props.validator.validateAll(result => {
      console.log("Result from callback", result);
    });

    if (isValid) {
      alert("OK!");
    } else {
      alert("Errors: " + JSON.stringify(errors));
    }
  }
}

export default validate(
  [
    // Every field should have at least name and validators array.
    {
      name: "name",
      validators: [
        // You have to pass a function that will be called with current
        // field value. If it returns true, field will be considered as valid.
        {
          fn: name => !!name
        }
      ],
      error: "Name is required"
    },
    {
      name: "age",
      // Initial value can be computed based on App component's props.
      initialValueFromProps: props => props.user.age,
      validators: [
        // You can pass more than one validator. 
        // All of them will be called in specified order.
        {
          fn: age => parseInt(age) >= 18,
          error: "User must be older than 18 yo"
        },
        {
          fn: age => parseInt(age) <= 70,
          error: "User must be younger than 70 yo"
        }
      ]
    },
    {
      name: "role",
      // You can set up initial value.
      value: "user",
      validators: [
        {
          fn: role => !!role
        }
      ],
      error: "Role is required"
    },
    {
      name: "newsletter",
      validators: [
        // Validator function will receive the second argument - a list of all
        // fields and its values. You can use it to perform multifield validation.
        {
          fn: (newsletter, fields) => {
            return (
              (newsletter === true && fields.role.value === "user") ||
              fields.role.value === "admin"
            );
          }
        }
      ],
      error: "User must sing up for newsletter"
    },
    {
      name: "gender",
      value: "male"
    },
    {
      name: "note",
      // Initial value could be retrieved from 'note' prop of App component.
      // After first mount, 'note' prop will be overriden and converted to the
      // PropertyWithValidation. Any future change to
      // that prop (triggered in App's parrent) will not be reflected!
      initialValueFromProps: true,
      validators: [
        {
          fn: note => note && note.length < 160,
          error: "Note under 160 characters is required"
        }
      ]
    }
  ],
  // The second argument is a function, that return an list of fields
  // definitions like above. You can use it to dynamically create
  // fields, that deppend on external conditions, like parent's state or props.
  (props: AppProps) =>
    props.agreements.map(a => ({
      name: a.name,
      value: false,
      validators: [
        {
          fn: (value: any) => !!value,
          error: `Agreement ${a.name} is required.`
        }
      ]
    }))
)(App);
```


# API

## `validate(options: ValidationOption[])`

Higher Order Function that returns component with additional props. For every property defined in array of [ValidationOption](#validationoption)s your component will receive prop with the same name with shape described by [PropertyWithValidation](#propertywithvalidation--singlepropertywithvalidation--sharedvalidator).

# Interfaces

## `ValidationOption`

#### `name: string`
The name of the validated property. Props with that name will be exposed on decorated component (structure of that props is described below in [PropertyWithValidation](#propertywithvalidation)).

#### `value: string|boolean`
Initial value of the property. If property is a list, then all items in the list will have that value. If not provided, then
empty string will be used as default.

#### `initialValueFromProps?: boolean | (props: any) => any`
If you have to provide initial value from props (for example: from redux store), then you should specify `initialValueFromProps: true`. If `true` - value of prop with name specified in `name` property will be used as initial value.
If `function` provided, then function will be used to get value from all component props.

#### `syncValue?: boolean | (props: any) => any`
If `syncValue` is set to `true`, then after every update of props passed to the wrapped component the HOC will look for the the new value of the prop
with the same name as validated property and update validated property according to the new value if changed.
If `syncValue` is set to function, then after every update of props passed to the wrapped component the HOC will compute new value of the property using defined function and update validated property value if computed value is different than previous result of the computation.

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

#### `validateAll: (callback?: (ValidateAllResult) => void) => ValidateAllResult`
Method to validate all properties. You can pass callback in which you will be able to read all errors from properties
and react to the result of validation.
Returns `true` if all properties are valid.

#### `errorCount: number`
Total number of errors for all properties.

## `ValidateAllResult` 

#### `isValid: boolean`

#### `errors: {[key: string]: string[]}}`

# TODO

- [ ] Accept error message as a function and pass props and value to it