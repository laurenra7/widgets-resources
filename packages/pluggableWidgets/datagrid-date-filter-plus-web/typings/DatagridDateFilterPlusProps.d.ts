/**
 * This file was generated from DatagridDateFilterPlus.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue } from "mendix";

export type DefaultFilterEnum =
    | "between"
    | "greater"
    | "greaterEqual"
    | "equal"
    | "notEqual"
    | "smaller"
    | "smallerEqual"
    | "empty"
    | "notEmpty"
    | "useSavedFilter";

export interface DatagridDateFilterPlusContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    advanced: boolean;
    defaultFilter: DefaultFilterEnum;
    savedFilter?: DynamicValue<string>;
    filterAttribute?: EditableValue<string>;
    placeholder?: DynamicValue<string>;
    adjustable: boolean;
    defaultValue?: DynamicValue<Date>;
    valueAttribute?: EditableValue<Date>;
    defaultStartDate?: DynamicValue<Date>;
    defaultEndDate?: DynamicValue<Date>;
    startDateAttribute?: EditableValue<Date>;
    endDateAttribute?: EditableValue<Date>;
    onChange?: ActionValue;
    screenReaderButtonCaption?: DynamicValue<string>;
    screenReaderCalendarCaption?: DynamicValue<string>;
    screenReaderInputCaption?: DynamicValue<string>;
}

export interface DatagridDateFilterPlusPreviewProps {
    className: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    advanced: boolean;
    defaultFilter: DefaultFilterEnum;
    savedFilter: string;
    filterAttribute: string;
    placeholder: string;
    adjustable: boolean;
    defaultValue: string;
    valueAttribute: string;
    defaultStartDate: string;
    defaultEndDate: string;
    startDateAttribute: string;
    endDateAttribute: string;
    onChange: {} | null;
    screenReaderButtonCaption: string;
    screenReaderCalendarCaption: string;
    screenReaderInputCaption: string;
}
