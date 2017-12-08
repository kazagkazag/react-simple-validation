import "jest";
import * as React from "react";
import {mount} from "enzyme";
import {validate} from "../validate";

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

    test("should pass property value from external prop", () => {
        const Checker = (props: any) => {
            return <h1>Checker</h1>;
        };

        @validate([{
            external: true,
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

    test("should initialize property value from external prop", () => {
        const Checker = (props: any) => {
            return <h1>Checker</h1>;
        };

        @validate([{
            initialValueFromProps: true,
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

});
/* tslint:enable max-classes-per-file */
