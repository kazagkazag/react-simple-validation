import "jest";
import * as React from "react";
import { mount } from "enzyme";
import { validate } from "../validate";

/* tslint:disable max-classes-per-file */
describe("validate", () => {
    test("should validate property", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <input onChange={() => props.testProp1.change("Test")} />
                    <button
                        onClick={() => {
                            props.testProp1.validate();
                        }}
                    >
                        Test
                    </button>
                </div>
            );
        };

        @validate([
            {
                name: "testProp1",
                value: "",
                validators: [
                    {
                        fn: (value: any) => value.length > 0,
                        error: "Validator error"
                    }
                ],
                error: "Some error"
            }
        ])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent />);

        testComponentWithValidation
            .find(Checker)
            .find("input")
            .simulate("change");
        testComponentWithValidation
            .find(Checker)
            .find("button")
            .simulate("click");

        expect(
            testComponentWithValidation.state().properties.testProp1.value
        ).toBe("Test");
        expect(
            testComponentWithValidation.state().properties.testProp1.errors
        ).toEqual([]);
    });

    test("should return info about validation succeeded", () => {
        const Checker = (props: any) => {
            return <div />;
        };

        @validate([
            {
                name: "testProp1",
                value: "Pass validation",
                validators: [
                    {
                        fn: (value: any) => value.length > 0,
                        error: "Validator error"
                    }
                ],
                error: "Some error"
            }
        ])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent />);

        const result = testComponentWithValidation
            .find(Checker)
            .props()
            .testProp1.validate();
        expect(result.isValid).toBe(true);
        expect(result.errors).toBe(null);
    });

    test("should return info about validation failed", () => {
        const Checker = (props: any) => {
            return <div />;
        };

        @validate([
            {
                name: "testProp1",
                value: "Do not pass validation",
                validators: [
                    {
                        fn: (value: any) => value === "Pass validation",
                        error: "Validator error"
                    }
                ],
                error: "Some error"
            }
        ])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent />);

        const result = testComponentWithValidation
            .find(Checker)
            .props()
            .testProp1.validate();
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(["Validator error"]);
    });

    test("should validate property initialized from external props", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <button
                        onClick={() => {
                            props.testProp1.validate();
                        }}
                    >
                        Test
                    </button>
                    <p id="error">Error: {props.testProp1.errors}</p>
                </div>
            );
        };

        @validate([
            {
                initialValueFromProps: true,
                name: "testProp1",
                validators: [
                    {
                        fn: (value: any) => value.length < 10,
                        error: "Validator error"
                    }
                ],
                error: "Some error"
            }
        ])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        class PropsProvider extends React.Component<any, any> {
            public render() {
                return (
                    <TestComponent
                        testProp1="some very long value"
                        change={jest.fn()}
                    />
                );
            }
        }

        const propsProvider = mount(<PropsProvider />);

        propsProvider
            .find(Checker)
            .find("button")
            .simulate("click");

        expect(propsProvider.text()).toContain("Validator error");
    });

    test("should validate property based on another property value", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <input onChange={() => props.testProp1.change("Test")} />
                    <button
                        onClick={() => {
                            props.testProp1.validate();
                        }}
                    >
                        Test
                    </button>
                </div>
            );
        };

        @validate([
            {
                name: "testProp1",
                value: "",
                validators: [
                    {
                        fn: (value: any, properties: any) =>
                            value === properties.testProp2.value,
                        error: "Validator error"
                    }
                ],
                error: "Some error"
            },
            {
                name: "testProp2",
                value: "Test",
                validators: [
                    {
                        fn: (value: any) => value.length > 0,
                        error: "Validator error"
                    }
                ],
                error: "Some error"
            }
        ])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent />);

        testComponentWithValidation
            .find(Checker)
            .find("input")
            .simulate("change");
        testComponentWithValidation
            .find(Checker)
            .find("button")
            .simulate("click");

        expect(
            testComponentWithValidation.state().properties.testProp1.value
        ).toBe("Test");
        expect(
            testComponentWithValidation.state().properties.testProp1.errors
        ).toEqual([]);
    });

    test("should be able to validate all properties", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <input
                        onChange={() => {
                            props.testProp1.change("");
                            props.testProp2.change(2);
                        }}
                    />
                    <button
                        onClick={() => {
                            props.validator.validateAll();
                        }}
                    >
                        Test
                    </button>
                </div>
            );
        };

        @validate([
            {
                name: "testProp1",
                value: "",
                validators: [
                    {
                        fn: (value: any) => value.length > 0
                    }
                ],
                error: "Prop 1 error"
            },
            {
                name: "testProp2",
                value: 1,
                validators: [
                    {
                        fn: (value: any) => value.length > 3
                    }
                ],
                error: "Prop 2 error"
            }
        ])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent />);

        testComponentWithValidation
            .find(Checker)
            .find("input")
            .simulate("change");
        testComponentWithValidation
            .find(Checker)
            .find("button")
            .simulate("click");

        expect(
            testComponentWithValidation.state().properties.testProp1.errors
        ).toEqual(["Prop 1 error"]);
        expect(
            testComponentWithValidation.state().properties.testProp2.errors
        ).toEqual(["Prop 2 error"]);
    });

    test("should be able to validate all properties and return info if validation succeeded", () => {
        const Checker = (props: any) => {
            return <div />;
        };

        @validate([
            {
                name: "testProp1",
                value: "pass validation",
                validators: [
                    {
                        fn: (value: any) => value.length > 0
                    }
                ],
                error: "Prop 1 error"
            },
            {
                name: "testProp2",
                value: "pass validation too",
                validators: [
                    {
                        fn: (value: any) => value.length > 0
                    }
                ],
                error: "Prop 2 error"
            }
        ])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent />);
        const result = testComponentWithValidation
            .find(Checker)
            .props()
            .validator.validateAll();

        expect(result.isValid).toBe(true);
        expect(result.errors).toBe(null);
    });

    test("should be able to validate all properties and return info if validation failed", () => {
        const Checker = (props: any) => {
            return <div />;
        };

        @validate([
            {
                name: "testProp1",
                value: "pass validation",
                validators: [
                    {
                        fn: (value: any) => value.length > 0
                    }
                ],
                error: "Prop 1 error"
            },
            {
                name: "testProp2",
                value: "do not pass validation too",
                validators: [
                    {
                        fn: (value: any) => value.length === "pass validation"
                    }
                ],
                error: "Prop 2 error"
            }
        ])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent />);
        const result = testComponentWithValidation
            .find(Checker)
            .props()
            .validator.validateAll();

        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual({
            testProp2: ["Prop 2 error"]
        });
    });

    test("should expose global error count", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <input
                        onChange={() => {
                            props.testProp1.change("");
                            props.testProp2.change(2);
                        }}
                    />
                    <button
                        onClick={() => {
                            props.validator.validateAll();
                        }}
                    >
                        Test
                    </button>
                </div>
            );
        };

        @validate([
            {
                name: "testProp1",
                value: "",
                validators: [
                    {
                        fn: (value: any) => value.length > 0
                    }
                ],
                error: "Prop 1 error"
            },
            {
                name: "testProp2",
                value: 1,
                validators: [
                    {
                        fn: (value: any) => value.length > 3
                    }
                ],
                error: "Prop 2 error"
            }
        ])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent />);

        testComponentWithValidation
            .find(Checker)
            .find("input")
            .simulate("change");
        testComponentWithValidation
            .find(Checker)
            .find("button")
            .simulate("click");

        expect(
            testComponentWithValidation.find(Checker).props().validator
                .errorsCount
        ).toBe(2);
    });

    test("should be able to validate all properties and call success callback", () => {
        const callback = jest.fn();
        const Checker = (props: any) => {
            return (
                <div>
                    <input
                        onChange={() => {
                            props.testProp1.change("test");
                            props.testProp2.change(2);
                        }}
                    />
                    <button
                        onClick={() => {
                            props.validator.validateAll(callback);
                        }}
                    >
                        Test
                    </button>
                </div>
            );
        };

        @validate([
            {
                name: "testProp1",
                value: "",
                validators: [
                    {
                        fn: (value: any) => value.length > 0
                    }
                ],
                error: "Prop 1 error"
            },
            {
                name: "testProp2",
                value: 1,
                validators: [
                    {
                        fn: (value: any) => value === 2
                    }
                ],
                error: "Prop 2 error"
            }
        ])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent />);

        testComponentWithValidation
            .find(Checker)
            .find("input")
            .simulate("change");
        testComponentWithValidation
            .find(Checker)
            .find("button")
            .simulate("click");

        expect(callback).toBeCalledWith({
            isValid: true,
            errors: null
        });
    });

    test("should be able to validate all properties and call callback with errors", () => {
        const callback = jest.fn();
        const Checker = (props: any) => {
            return (
                <div>
                    <input
                        onChange={() => {
                            props.testProp1.change("test");
                            props.testProp2.change(2);
                        }}
                    />
                    <button
                        onClick={() => {
                            props.validator.validateAll(callback);
                        }}
                    >
                        Test
                    </button>
                </div>
            );
        };

        @validate([
            {
                name: "testPropFirst",
                value: "",
                validators: [
                    {
                        fn: (value: any) => value === "Impossible value"
                    }
                ],
                error: "Prop 1 error"
            },
            {
                name: "testPropSecond",
                value: 1,
                validators: [
                    {
                        fn: (value: any) => value === "Impossible value"
                    }
                ],
                error: "Prop 2 error"
            }
        ])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent />);

        testComponentWithValidation
            .find(Checker)
            .find("button")
            .simulate("click");

        expect(callback).toBeCalledWith({
            isValid: false,
            errors: {
                testPropFirst: ["Prop 1 error"],
                testPropSecond: ["Prop 2 error"]
            }
        });
    });
});
/* tslint:enable max-classes-per-file */
