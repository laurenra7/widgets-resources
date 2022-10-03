import { createElement, ReactElement } from "react";
import { DatagridTextFilterPlusPreviewProps } from "../typings/DatagridTextFilterPlusProps";
import { FilterPlusComponent } from "./components/FilterPlusComponent";
import { parseStyle } from "@mendix/piw-utils-internal";

export function preview(props: DatagridTextFilterPlusPreviewProps): ReactElement {
    return (
        <FilterPlusComponent
            adjustable={props.adjustable}
            className={props.className}
            defaultFilter={props.defaultFilter}
            savedFilter={props.savedFilter}
            delay={props.delay ?? 500}
            placeholder={props.placeholder}
            screenReaderButtonCaption={props.screenReaderButtonCaption}
            screenReaderInputCaption={props.screenReaderInputCaption}
            styles={parseStyle(props.style)}
            value={props.defaultValue}
        />
    );
}
