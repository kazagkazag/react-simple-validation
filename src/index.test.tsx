import "jest";
import * as React from "react";
import {mount} from "enzyme";
import {validate} from "./validate";

/* tslint:disable max-classes-per-file */
describe("validate", () => {
    test("should expose info about every validated property", () => {
        const Checker = (props: any) => {
            return <h1>Checker</h1>;
        };

        @validate([{
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => !!value,
                error: "Some error"
            }],
            error: "Some error"
        }, {
            name: "testProp2",
            value: false,
            validators: [{
                fn: (value: any) => !!value,
                error: "Some error"
            }]
        }, {
            list: true,
            length: 3,
            name: "testProp3",
            value: false,
            validators: [{
                fn: (value: any) => !!value,
                error: "Some error"
            }]
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);
        const checker = testComponentWithValidation.find(Checker);

        expect(checker.props().testProp1.value).toBe("");
        expect(typeof checker.props().testProp1.change).toBe("function");
        expect(checker.props().testProp1.errors).toEqual([]);
        expect(typeof checker.props().testProp1.validate).toBe("function");
        expect(typeof checker.props().testProp1.cleanErrors).toBe("function");

        expect(checker.props().testProp2.value).toBe(false);
        expect(typeof checker.props().testProp2.change).toBe("function");
        expect(checker.props().testProp2.errors).toEqual([]);
        expect(typeof checker.props().testProp2.validate).toBe("function");
        expect(typeof checker.props().testProp2.cleanErrors).toBe("function");

        expect(checker.props().testProp3.length).toBe(3);
        expect(checker.props().testProp3[0].value).toBe(false);
        expect(typeof checker.props().testProp3[0].change).toBe("function");
        expect(checker.props().testProp3[0].errors).toEqual([]);
        expect(typeof checker.props().testProp3[0].validate).toBe("function");
        expect(typeof checker.props().testProp3[0].cleanErrors).toBe("function");

        expect(typeof checker.props().validator.validateAll).toBe("function");
    });

    test("should psas property value from external prop", () => {
        const Checker = (props: any) => {
            return <h1>Checker</h1>;
        };

        @validate([{
            external: true,
            changeHandlerName: "change",
            name: "testProp1",
            validators: [{
                fn: (value: any) => value === "some value",
                error: "Some error"
            }],
            error: "Some error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props}/>;
            }
        }

        class PropsProvider extends React.Component<any, any> {
            public render() {
                return <TestComponent testProp1="some value" change={jest.fn()}/>;
            }
        }

        const propsProvider = mount(<PropsProvider/>);
        const checker = propsProvider.find(Checker);

        expect(checker.props().testProp1.value).toBe("some value");
        expect(typeof checker.props().testProp1.change).toBe("function");
        expect(checker.props().testProp1.errors).toEqual([]);
        expect(typeof checker.props().testProp1.validate).toBe("function");
        expect(typeof checker.props().testProp1.cleanErrors).toBe("function");
    });

    test("should be able to change property", () => {
        const Checker = (props: any) => {
            return (
                <button
                    onClick={() => {
                        props.testProp1.change("Test new value");
                        props.testProp2.change(true);
                    }}
                >
                    Test
                </button>
            );
        };

        @validate([{
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => !!value,
                error: "Some error"
            }],
            error: "Some error"
        }, {
            name: "testProp2",
            value: false,
            validators: [{
                fn: (value: any) => !!value,
                error: "Some error"
            }]
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.state().properties.testProp1.value).toBe("Test new value");
        expect(testComponentWithValidation.state().properties.testProp2.value).toBe(true);
    });

    test("should be able to change property from external props calling external handler", () => {
        const Checker = (props: any) => {
            return (
                <button
                    onClick={() => {
                        props.testProp1.change("Test new value");
                    }}
                >
                    Test
                </button>
            );
        };

        @validate([{
            external: true,
            name: "testProp1",
            changeHandlerName: "change",
            validators: [{
                fn: (value: any) => value === "some value",
                error: "Some error"
            }],
            error: "Some error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const externalChanger = jest.fn();

        class PropsProvider extends React.Component<any, any> {
            public render() {
                return (
                    <TestComponent
                        testProp1="some value"
                        change={externalChanger}
                    />
                );
            }
        }

        const propsProvider = mount(<PropsProvider/>);
        const checker = propsProvider.find(Checker);

        checker.find("button").simulate("click");

        expect(externalChanger).toHaveBeenCalledWith("Test new value");
    });

    test("should be able to change value of item in property", () => {
        const Checker = (props: any) => {
            return (
                <button
                    onClick={() => {
                        props.testProp1[0].change("Test new value");
                    }}
                >
                    Test
                </button>
            );
        };

        @validate([{
            list: true,
            length: 3,
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => !!value,
                error: "Some error"
            }],
            error: "Some error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.state().properties.testProp1[0].value).toBe("Test new value");
    });

    test("should be able to validate property", () => {
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

        @validate([{
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => value.length > 0,
                error: "Validator error"
            }],
            error: "Some error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("input").simulate("change");
        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.state().properties.testProp1.value).toBe("Test");
        expect(testComponentWithValidation.state().properties.testProp1.errors).toEqual([]);
    });

    test("should be able to validate external property", () => {
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
                    <p id="error">Error: {props.testProp1.errors}</p>
                </div>
            );
        };

        @validate([{
            external: true,
            changeHandlerName: "change",
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => value.length > 10,
                error: "Validator error"
            }],
            error: "Some error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        class PropsProvider extends React.Component<any, any> {
            public render() {
                return (
                    <TestComponent
                        testProp1="some value"
                        change={jest.fn()}
                    />
                );
            }
        }

        const propsProvider = mount(<PropsProvider/>);

        propsProvider.find(Checker).find("button").simulate("click");

        expect(propsProvider.text()).toContain("Validator error");
    });

    test("should be able to validate property based on another property value", () => {
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

        @validate([{
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any, properties: any) => value === properties.testProp2.value,
                error: "Validator error"
            }],
            error: "Some error"
        }, {
            name: "testProp2",
            value: "Test",
            validators: [{
                fn: (value: any) => value.length > 0,
                error: "Validator error"
            }],
            error: "Some error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("input").simulate("change");
        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.state().properties.testProp1.value).toBe("Test");
        expect(testComponentWithValidation.state().properties.testProp1.errors).toEqual([]);
    });

    test("should be able to validate item of property", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <input onChange={() => props.testProp1[0].change("Test")} />
                    <button
                        onClick={() => {
                            props.testProp1[0].validate();
                        }}
                    >
                        Test
                    </button>
                </div>
            );
        };

        @validate([{
            list: true,
            length: 3,
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => !!value,
                error: "Some error"
            }],
            error: "Some error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("input").simulate("change");
        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.state().properties.testProp1[0].value).toBe("Test");
        expect(testComponentWithValidation.state().properties.testProp1[0].errors).toEqual([]);
    });

    test("should be able to collect validation error from validators", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <input onChange={() => props.testProp1.change("")} />
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

        @validate([{
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => value.length > 0,
                error: "Validator error 1"
            }, {
                fn: (value: any) => value.length > 1,
                error: "Validator error 2"
            }],
            error: "Some error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("input").simulate("change");
        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.state().properties.testProp1.value).toBe("");
        expect(testComponentWithValidation.state().properties.testProp1.errors).toEqual([
            "Validator error 1",
            "Validator error 2"
        ]);
    });

    test("should be able to validate all properties", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <input onChange={() => {
                        props.testProp1.change("");
                        props.testProp2.change(2);
                    }} />
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

        @validate([{
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => value.length > 0,
            }],
            error: "Prop 1 error"
        }, {
            name: "testProp2",
            value: 1,
            validators: [{
                fn: (value: any) => value.length > 3,
            }],
            error: "Prop 2 error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("input").simulate("change");
        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.state().properties.testProp1.errors).toEqual([
            "Prop 1 error"
        ]);
        expect(testComponentWithValidation.state().properties.testProp2.errors).toEqual([
            "Prop 2 error"
        ]);
    });

    test("should be able to validate all properties and call success callback", () => {
        const callback = jest.fn();
        const Checker = (props: any) => {
            return (
                <div>
                    <input onChange={() => {
                        props.testProp1.change("test");
                        props.testProp2.change(2);
                    }} />
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

        @validate([{
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => value.length > 0,
            }],
            error: "Prop 1 error"
        }, {
            name: "testProp2",
            value: 1,
            validators: [{
                fn: (value: any) => value.length > 1,
            }],
            error: "Prop 2 error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("input").simulate("change");
        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(callback).toBeCalled();
    });

    test("should be able to collect validation error from validators in item of property", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <input onChange={() => props.testProp1[1].change("")} />
                    <button
                        onClick={() => {
                            props.testProp1[1].validate();
                        }}
                    >
                        Test
                    </button>
                </div>
            );
        };

        @validate([{
            list: true,
            length: 3,
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => value.length > 0,
                error: "Validator error 1"
            }, {
                fn: (value: any) => value.length > 1,
                error: "Validator error 2"
            }],
            error: "Some error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("input").simulate("change");
        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.state().properties.testProp1[1].value).toBe("");
        expect(testComponentWithValidation.state().properties.testProp1[1].errors).toEqual([
            "Validator error 1",
            "Validator error 2"
        ]);
    });

    test("should be able to collect validation error from fallback error", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <input onChange={() => props.testProp1.change("")} />
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

        @validate([{
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => value.length > 0
            }, {
                fn: (value: any) => value.length > 1,
                error: "Validator error 2"
            }],
            error: "Fallback error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("input").simulate("change");
        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.state().properties.testProp1.value).toBe("");
        expect(testComponentWithValidation.state().properties.testProp1.errors).toEqual([
            "Fallback error",
            "Validator error 2"
        ]);
    });

    test("should be able to collect validation error from fallback error for item in property", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <input onChange={() => props.testProp1[1].change("")} />
                    <button
                        onClick={() => {
                            props.testProp1[1].validate();
                        }}
                    >
                        Test
                    </button>
                </div>
            );
        };

        @validate([{
            list: true,
            length: 3,
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => value.length > 0
            }, {
                fn: (value: any) => value.length > 1,
                error: "Validator error 2"
            }],
            error: "Fallback error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("input").simulate("change");
        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.state().properties.testProp1[1].value).toBe("");
        expect(testComponentWithValidation.state().properties.testProp1[1].errors).toEqual([
            "Fallback error",
            "Validator error 2"
        ]);
    });

    test("should be able to clean errors", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <input onChange={() => props.testProp1.change("")} />
                    <button
                        id="validate"
                        onClick={() => {
                            props.testProp1.validate();
                        }}
                    >
                        Test
                    </button>
                    <button
                        id="clean"
                        onClick={() => {
                            props.testProp1.cleanErrors();
                        }}
                    >
                        Test
                    </button>
                </div>
            );
        };

        @validate([{
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => value.length > 0
            }, {
                fn: (value: any) => value.length > 1,
                error: "Validator error 2"
            }],
            error: "Fallback error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("input").simulate("change");
        testComponentWithValidation.find(Checker).find("#validate").simulate("click");
        testComponentWithValidation.find(Checker).find("#clean").simulate("click");

        expect(testComponentWithValidation.state().properties.testProp1.value).toBe("");
        expect(testComponentWithValidation.state().properties.testProp1.errors).toEqual([]);
    });

    test("should be able to clean errors of item in property", () => {
        const Checker = (props: any) => {
            return (
                <div>
                    <input onChange={() => props.testProp1[0].change("")} />
                    <button
                        id="validate"
                        onClick={() => {
                            props.testProp1[0].validate();
                        }}
                    >
                        Test
                    </button>
                    <button
                        id="clean"
                        onClick={() => {
                            props.testProp1[0].cleanErrors();
                        }}
                    >
                        Test
                    </button>
                </div>
            );
        };

        @validate([{
            list: true,
            length: 3,
            name: "testProp1",
            value: "",
            validators: [{
                fn: (value: any) => value.length > 0
            }, {
                fn: (value: any) => value.length > 1,
                error: "Validator error 2"
            }],
            error: "Fallback error"
        }])
        class TestComponent extends React.Component<any, any> {
            public render() {
                return <Checker {...this.props} />;
            }
        }

        const testComponentWithValidation = mount(<TestComponent/>);

        testComponentWithValidation.find(Checker).find("input").simulate("change");
        testComponentWithValidation.find(Checker).find("#validate").simulate("click");
        testComponentWithValidation.find(Checker).find("#clean").simulate("click");

        expect(testComponentWithValidation.state().properties.testProp1[0].value).toBe("");
        expect(testComponentWithValidation.state().properties.testProp1[0].errors).toEqual([]);
    });

});
/* tslint:enable max-classes-per-file */
