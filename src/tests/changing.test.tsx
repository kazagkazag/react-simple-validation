import "jest";
import * as React from "react";
import { Checker, mountTestComponent } from "./utils";
import { validate } from "../validate";

/* tslint:disable max-classes-per-file */
describe("validate", () => {

    test("should change property", () => {
        const testComponentWithValidation = mountTestComponent([{
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
        }]);

        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.find(".testProp1Value").text()).toBe("Test new value");
        expect(testComponentWithValidation.find(".testProp2Value").text()).toBe("true");
    });

    test("should change property initialized from external props", () => {
        const testComponentWithValidation = mountTestComponent([{
            name: "testProp1",
            initialValueFromProps: true,
            validators: [{
                fn: (value: any) => !!value,
                error: "Some error"
            }],
            error: "Some error"
        }], {
                testProp1: "Old value"
            });

        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.find(".testProp1Value").text()).toBe("Test new value");
    });

    test("should change value of item in property", () => {
        const testComponentWithValidation = mountTestComponent([{
            list: true,
            length: 3,
            name: "testProp3",
            value: "",
            validators: [{
                fn: (value: any) => !!value,
                error: "Some error"
            }],
            error: "Some error"
        }]);

        testComponentWithValidation.find(Checker).find("button").simulate("click");

        expect(testComponentWithValidation.find(".testProp3Value").text()).toBe("Test new value");
    });

});
/* tslint:enable max-classes-per-file */
