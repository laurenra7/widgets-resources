/**
 * This file was generated from RadioButtonsPlus.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue } from "mendix";

export type OrientationEnum = "vertical" | "horizontal";

export interface ButtonsListType {
    enumName: string;
    enumCaption: string;
    subtextString: string;
}

export interface ButtonsListPreviewType {
    enumName: string;
    enumCaption: string;
    subtextString: string;
}

export interface RadioButtonsPlusContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    orientation: OrientationEnum;
    enum: EditableValue<string>;
    buttonsList: ButtonsListType[];
    showLabel: boolean;
    label?: DynamicValue<string>;
    onChange?: ActionValue;
}

export interface RadioButtonsPlusPreviewProps {
    className: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    orientation: OrientationEnum;
    enum: string;
    buttonsList: ButtonsListPreviewType[];
    showLabel: boolean;
    label: string;
    onChange: {} | null;
}
