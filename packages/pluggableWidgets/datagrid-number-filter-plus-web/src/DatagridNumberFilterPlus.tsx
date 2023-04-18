import { createElement, ReactElement, useRef } from "react";
import { DatagridNumberFilterPlusContainerProps, DefaultFilterEnum } from "../typings/DatagridNumberFilterPlusProps";

import { FilterPlusComponent } from "./components/FilterPlusComponent";
import {
    Alert,
    NoLimitFilterType,
    getNoLimitFilterDispatcher,
    generateUUID
} from "@mendix/piw-utils-internal/components/web";
import { Big } from "big.js";

import {
    attribute,
    equals,
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    literal,
    notEqual,
    or
} from "mendix/filters/builders";
import { FilterCondition } from "mendix/filters";
import { ListAttributeValue } from "mendix";
import { translateFilters } from "./utils/filters";

export default function DatagridNumberFilterPlus(props: DatagridNumberFilterPlusContainerProps): ReactElement {
    const id = useRef(`NumberFilter${generateUUID()}`);

    const FilterContext = getNoLimitFilterDispatcher();
    const alertMessage = (
        <Alert bootstrapStyle="danger">
            The Number filter widget must be placed inside the header of the Data grid 2.0 or Gallery widget.
        </Alert>
    );
    const alertMessageMultipleFilters = (
        <Alert bootstrapStyle="danger">
            The Number filter widget can&apos;t be used with the filters options you have selected. It requires a
            &quot;Autonumber, Decimal, Integer or Long&quot; attribute to be selected.
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
                        savedFilter={props.savedFilter?.value ? props.savedFilter?.value : "greater"}
                        delay={props.delay}
                        id={id.current}
                        placeholder={props.placeholder?.value}
                        screenReaderButtonCaption={props.screenReaderButtonCaption?.value}
                        screenReaderInputCaption={props.screenReaderInputCaption?.value}
                        styles={props.style}
                        tabIndex={props.tabIndex}
                        updateFilters={(value: Big | undefined, type: DefaultFilterEnum): void => {
                            let shouldExecuteOnChange = false;
                            if (
                                (value && !props.valueAttribute?.value?.eq(value)) ||
                                value !== props.valueAttribute?.value
                            ) {
                                props.valueAttribute?.setValue(value);
                                shouldExecuteOnChange = true;
                            }
                            switch (type) {
                                case "smallerEqual":
                                case "smaller":
                                case "notEqual":
                                case "greaterEqual":
                                case "greater":
                                case "equal":
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
                                filterType: NoLimitFilterType.NUMBER,
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

/**
 * Finds the filter by the filterName (assigned to the filter widget by the
 * developer in the widget properties under Common > Name). Returns an array
 * of filters (usually just 1) that will be applied to the list.
 * @param multipleAttributes
 * @param filterName
 */
function findAttributesByName(
    multipleAttributes?: {
        [key: string]: {
            filter: ListAttributeValue;
            filterName: string;
        };
    },
    filterName?: string
): ListAttributeValue[] | undefined {
    if (!multipleAttributes) {
        return undefined;
    }
    return Object.keys(multipleAttributes)
        .map(key => multipleAttributes[key])
        .filter(attr => attr.filterName === filterName)
        .map(attr => attr.filter);
}

function getAttributeTypeErrorMessage(type?: string): string | null {
    return type && !type.match(/AutoNumber|Decimal|Integer|Long/)
        ? "The attribute type being used for Number filter is not 'Autonumber, Decimal, Integer or Long'"
        : null;
}

function getFilterCondition(
    listAttribute: ListAttributeValue,
    value: Big | undefined,
    type: DefaultFilterEnum
): FilterCondition | undefined {
    if (!listAttribute || !listAttribute.filterable || (type !== "empty" && type !== "notEmpty" && !value)) {
        return undefined;
    }

    const filters = {
        greater: greaterThan,
        greaterEqual: greaterThanOrEqual,
        equal: equals,
        notEqual,
        smaller: lessThan,
        smallerEqual: lessThanOrEqual,
        empty: equals,
        notEmpty: notEqual,
        useSavedFilter: greaterThan
    };

    return filters[type](
        attribute(listAttribute.id),
        literal(type === "empty" || type === "notEmpty" ? undefined : value)
    );
}