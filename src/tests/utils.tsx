import * as React from "react";
import { mount } from "enzyme";
import { validate } from "../validate";

/* tslint:disable max-classes-per-file */
export const Checker = (props: any) => {
    return (
        <div>
            <button
                onClick={() => {
                    if (!props) {
                        return;

                    }

                    if (props.testProp1) {
                        props.testProp1.change("Test new value");
                    }

                    if (props.testProp2) {
                        props.testProp2.change(true);
                    }

                    if (props.testProp3) {
                        props.testProp3[0].change("Test new value");
                    }
                }}
            >
                Test
            </button>
            <p className="testProp1Value">{props && props.testProp1 && props.testProp1.value}</p>
            <p className="testProp2Value">{props && props.testProp2 && JSON.stringify(props.testProp2.value)}</p>
            <p className="testProp3Value">{props && props.testProp3 && props.testProp3[0].value}</p>
        </div>
    );
};

export function mountTestComponent(config: any, parentProps: any = {}) {
    @validate(config)
    class TestComponent extends React.Component<any, any> {
        public render() {
            return <Checker {...this.props} />;
        }
    }

    class PropsProvider extends React.Component<any, any> {
        public render() {
            return <TestComponent {...parentProps} />;
        }
    }

    return mount(<PropsProvider />);
}
/* tslint:enable max-classes-per-file */
