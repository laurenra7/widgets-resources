/**
 * This file was generated from DropdownSort.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue } from "mendix";

export interface DropdownSortContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    emptyOptionCaption?: DynamicValue<string>;
    defaultValue?: DynamicValue<string>;
    valueAttribute?: EditableValue<string>;
    onChange?: ActionValue;
    screenReaderButtonCaption?: DynamicValue<string>;
    screenReaderInputCaption?: DynamicValue<string>;
}

export interface DropdownSortPreviewProps {
    className: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    emptyOptionCaption: string;
    defaultValue: string;
    valueAttribute: string;
    onChange: {} | null;
    screenReaderButtonCaption: string;
    screenReaderInputCaption: string;
}
