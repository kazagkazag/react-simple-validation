import "jest";
import * as React from "react";
import {mount} from "enzyme";
import {validate} from "../validate";

/* tslint:disable max-classes-per-file */
describe("validate", () => {

    test("should change property", () => {
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

    test("should change property initialized from external props", () => {
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
            name: "testProp1",
            initialValueFromProps: true,
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

        expect(testComponentWithValidation.state().properties.testProp1.value).toBe("Test new value");
    });

    test("should change value of item in property", () => {
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

});
/* tslint:enable max-classes-per-file */
