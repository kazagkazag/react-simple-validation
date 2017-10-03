// Type definitions for React Simple Validation
// Project: React Simple Validation
// Definitions by: Kamil Zagrabski

import * as React from "react";
import {Property} from "./src/validate";

export function validate(properties: Property[]): <OriginalProps extends {}>(
    BaseComponent: React.ComponentClass<OriginalProps> | React.StatelessComponent<OriginalProps>
) => any;

export interface PopertyWithValidation {
    value: any;
    errors: string[];
    change: (value: any) => void;
    validate: () => void;
    cleanErrors: () => void;
}