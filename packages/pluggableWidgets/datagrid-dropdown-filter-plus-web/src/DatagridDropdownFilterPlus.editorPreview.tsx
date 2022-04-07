import { createElement, ReactElement } from "react";
import { DatagridDropdownFilterPlusPreviewProps } from "../typings/DatagridDropdownFilterPlusProps";
import { FilterComponentPlus } from "./components/FilterComponentPlus";
import { parseStyle } from "@mendix/piw-utils-internal";

export function preview(props: DatagridDropdownFilterPlusPreviewProps): ReactElement {
    return (
        <FilterComponentPlus
            ariaLabel={props.ariaLabel}
            className={props.className}
            defaultValue={props.defaultValue}
            options={[{ caption: "optionCaption", value: "option" }]}
            styles={parseStyle(props.style)}
        />
    );
}
