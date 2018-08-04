import "jest";
import * as React from "react";
import {mount} from "enzyme";
import {validate} from "../validate";

/* tslint:disable max-classes-per-file */
describe("validate", () => {

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

});
/* tslint:enable max-classes-per-file */
