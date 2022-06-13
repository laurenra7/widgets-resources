import { createElement, ReactElement } from "react";
import { DatagridNumberFilterPlusPreviewProps } from "../typings/DatagridNumberFilterPlusProps";
import { FilterPlusComponent } from "./components/FilterPlusComponent";
import { parseStyle } from "@mendix/piw-utils-internal";

export function preview(props: DatagridNumberFilterPlusPreviewProps): ReactElement {
    return (
        <FilterPlusComponent
            adjustable={props.adjustable}
            className={props.className}
            defaultFilter={props.defaultFilter}
            delay={props.delay ?? 500}
            placeholder={props.placeholder}
            screenReaderButtonCaption={props.screenReaderButtonCaption}
            screenReaderInputCaption={props.screenReaderInputCaption}
            styles={parseStyle(props.style)}
        />
    );
}
