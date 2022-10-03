import { createElement, ReactElement, useRef } from "react";
import { DatagridTextFilterPlusContainerProps, DefaultFilterEnum } from "../typings/DatagridTextFilterPlusProps";

import { FilterPlusComponent } from "./components/FilterPlusComponent";
import {
    Alert,
    NoLimitFilterType,
    getNoLimitFilterDispatcher,
    generateUUID
} from "@mendix/piw-utils-internal/components/web";

import {
    attribute,
    contains,
    endsWith,
    equals,
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    literal,
    notEqual,
    or,
    startsWith
} from "mendix/filters/builders";
import { FilterCondition } from "mendix/filters";
import { ListAttributeValue } from "mendix";
import { translateFilters } from "./utils/filters";

export default function DatagridTextFilterPlus(props: DatagridTextFilterPlusContainerProps): ReactElement {
    // const UUID = generateUUID();
    // const id = useRef(`TextFilter${UUID}`);
    const id = useRef(`TextFilter${generateUUID()}`);

    const FilterContext = getNoLimitFilterDispatcher();
    const alertMessage = (
        <Alert bootstrapStyle="danger">
            The Text filter widget must be placed inside the header of the Data grid 2.0 or Gallery widget.
        </Alert>
    );
    const alertMessageMultipleFilters = (
        <Alert bootstrapStyle="danger">
            The Text filter widget can&apos;t be used with the filters options you have selected. It requires a
            &quot;Hashed string or String&quot; attribute to be selected.
        </Alert>
    );

    return FilterContext?.Consumer ? (
        <FilterContext.Consumer>
            {noLimitfilterContextValue => {
                if (
                    !noLimitfilterContextValue ||
                    !noLimitfilterContextValue.filterDispatcher ||
                    (!noLimitfilterContextValue.singleAttribute && !noLimitfilterContextValue.multipleAttributes)
                ) {
                    return alertMessage;
                }
                const {
                    filterDispatcher,
                    singleAttribute,
                    multipleAttributes,
                    singleInitialFilter,
                    multipleInitialFilters
                } = noLimitfilterContextValue;

                const attributes = [
                    ...(singleAttribute ? [singleAttribute] : []),
                    ...(multipleAttributes ? findAttributesByName(multipleAttributes, props.name) ?? [] : [])
                ];

                if (attributes.length === 0) {
                    if (multipleAttributes) {
                        return alertMessageMultipleFilters;
                    }
                    return alertMessage;
                }

                const defaultFilter = singleInitialFilter
                    ? translateFilters(singleInitialFilter)
                    : translateFilters(multipleInitialFilters?.[attributes[0].id]);

                const errorMessage = getAttributeTypeErrorMessage(attributes[0].type);
                if (errorMessage) {
                    return <Alert bootstrapStyle="danger">{errorMessage}</Alert>;
                }

                return (
                    <FilterPlusComponent
                        adjustable={props.adjustable}
                        className={props.class}
                        defaultFilter={defaultFilter?.type ?? props.defaultFilter}
                        savedFilter={props.savedFilter?.value ? props.savedFilter?.value : "contains"}
                        delay={props.delay}
                        id={id.current}
                        placeholder={props.placeholder?.value}
                        screenReaderButtonCaption={props.screenReaderButtonCaption?.value}
                        screenReaderInputCaption={props.screenReaderInputCaption?.value}
                        styles={props.style}
                        tabIndex={props.tabIndex}
                        updateFilters={(value: string, type: DefaultFilterEnum): void => {
                            let shouldExecuteOnChange = false;
                            const attributeCurrentValue = props.valueAttribute?.value || "";
                            if (value !== attributeCurrentValue) {
                                props.valueAttribute?.setValue(value);
                                shouldExecuteOnChange = true;
                            }
                            switch (type) {
                                case "contains":
                                case "endsWith":
                                case "equal":
                                case "greater":
                                case "greaterEqual":
                                case "notEqual":
                                case "smaller":
                                case "smallerEqual":
                                case "startsWith":
                                    props.filterAttribute?.setValue(type);
                                    shouldExecuteOnChange = true;
                            }
                            if (shouldExecuteOnChange) {
                                props.onChange?.execute();
                            }
                            const conditions = attributes
                                ?.map(attribute => getFilterCondition(attribute, value, type))
                                .filter((filter): filter is FilterCondition => filter !== undefined);
                            filterDispatcher({
                                getFilterCondition: () =>
                                    conditions && conditions.length > 1 ? or(...conditions) : conditions?.[0],
                                filterType: NoLimitFilterType.STRING,
                                key: props.name
                            });
                        }}
                        value={defaultFilter?.value ?? props.defaultValue?.value}
                    />
                );
            }}
        </FilterContext.Consumer>
    ) : (
        alertMessage
    );
}

// function findAttributesByType(multipleAttributes?: {
//     [key: string]: {filter:ListAttributeValue, filterName:string };
// }, filterName?: string): ListAttributeValue[] | undefined {
//     if (!multipleAttributes) {
//         return undefined;
//     }
//     return Object.keys(multipleAttributes)
//         .map(key => multipleAttributes[key])
//         // .filter(attr => attr.type.match(/HashString|String/));
//         .filter(attr => attr.filterName === filterName)
//         .map(attr => attr.filter);
// }

function findAttributesByName(
    multipleAttributes?: {
        [key: string]: { filter: ListAttributeValue; filterName: string };
    },
    filterName?: string
): ListAttributeValue[] | undefined {
    if (!multipleAttributes) {
        return undefined;
    }
    return (
        Object.keys(multipleAttributes)
            .map(key => multipleAttributes[key])
            // .filter(attr => attr.type.match(/HashString|String/));
            .filter(attr => attr.filterName === filterName)
            .map(attr => attr.filter)
    );
}

function getAttributeTypeErrorMessage(type?: string): string | null {
    return type && !type.match(/HashString|String/)
        ? "The attribute type being used for Text filter is not 'Hashed string or String'"
        : null;
}

function getFilterCondition(
    listAttribute: ListAttributeValue,
    value: string,
    type: DefaultFilterEnum
): FilterCondition | undefined {
    if (!listAttribute || !listAttribute.filterable || !value) {
        return undefined;
    }

    const filters = {
        contains,
        startsWith,
        endsWith,
        greater: greaterThan,
        greaterEqual: greaterThanOrEqual,
        equal: equals,
        notEqual,
        smaller: lessThan,
        smallerEqual: lessThanOrEqual,
        useSavedFilter: contains
    };

    return filters[type](attribute(listAttribute.id), literal(value));
}
