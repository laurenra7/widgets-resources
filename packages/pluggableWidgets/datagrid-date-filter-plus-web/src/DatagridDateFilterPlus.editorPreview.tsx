import { createElement, ReactElement } from "react";
import { FilterComponentPlus } from "./components/FilterComponentPlus";
import { DatagridDateFilterPlusPreviewProps } from "../typings/DatagridDateFilterPlusProps";
import { parseStyle } from "@mendix/piw-utils-internal";

export function preview(props: DatagridDateFilterPlusPreviewProps): ReactElement {
    return (
        <FilterComponentPlus
            adjustable={props.adjustable}
            className={props.className}
            defaultFilter={props.defaultFilter}
            savedFilter={props.savedFilter}
            placeholder={props.placeholder}
            screenReaderButtonCaption={props.screenReaderButtonCaption}
            screenReaderCalendarCaption={props.screenReaderCalendarCaption}
            screenReaderInputCaption={props.screenReaderInputCaption}
            styles={parseStyle(props.style)}
        />
    );
}

export function getPreviewCss(): string {
    return require("react-datepicker/dist/react-datepicker.css");
}
