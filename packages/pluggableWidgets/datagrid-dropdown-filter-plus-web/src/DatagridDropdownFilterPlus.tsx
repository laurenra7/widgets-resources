import { createElement, ReactElement, useRef } from "react";
import { DatagridDropdownFilterPlusContainerProps } from "../typings/DatagridDropdownFilterPlusProps";
import { ValueStatus, ListAttributeValue } from "mendix";
import { FilterComponentPlus, FilterOptionPlus } from "./components/FilterComponentPlus";
import {
    Alert,
    NoLimitFilterType,
    // getFilterDispatcher,
    generateUUID,
    getNoLimitFilterDispatcher
} from "@mendix/piw-utils-internal/components/web";

import { attribute, equals, literal, or } from "mendix/filters/builders";
import { FilterCondition } from "mendix/filters";

export default function DatagridDropdownFilterPlus(props: DatagridDropdownFilterPlusContainerProps): ReactElement {
    const id = useRef(`DropdownFilterPlus${generateUUID()}`);

    // const FilterContext = getFilterDispatcher();
    const FilterContext = getNoLimitFilterDispatcher();
    const isAllOptionsReady = props.filterOptions.every(
        ({ value, caption }) => value.status === ValueStatus.Available && caption.status === ValueStatus.Available
    );
    const parsedOptions = isAllOptionsReady
        ? props.filterOptions.map(value => ({
              caption: value.caption.value ?? "",
              value: value.value.value ?? ""
          }))
        : [];

    const alertMessage = (
        <Alert bootstrapStyle="danger">
            The Drop-down filter widget must be placed inside the header of the Data grid 2.0 or Gallery widget.
        </Alert>
    );

    const alertMessageMultipleFilters = (
        <Alert bootstrapStyle="danger">
            The Drop-down filter widget can&apos;t be used with the filters options you have selected. It requires a
            &quot;Boolean or Enumeration&quot; attribute to be selected.
        </Alert>
    );

    return FilterContext?.Consumer ? (
        <FilterContext.Consumer>
            {filterContextValue => {
                if (
                    !filterContextValue ||
                    !filterContextValue.filterDispatcher ||
                    (!filterContextValue.singleAttribute && !filterContextValue.multipleAttributes)
                ) {
                    return alertMessage;
                }
                const {
                    filterDispatcher,
                    singleAttribute,
                    multipleAttributes,
                    singleInitialFilter,
                    multipleInitialFilters
                } = filterContextValue;

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

                const errorMessage =
                    getAttributeTypeErrorMessage(attributes[0].type) || validateValues(attributes, parsedOptions);

                if (errorMessage) {
                    return <Alert bootstrapStyle="danger">{errorMessage}</Alert>;
                }

                const defaultValues = singleInitialFilter
                    ? singleInitialFilter?.map(filter => filter.value).join(",")
                    : attributes
                          ?.flatMap(attribute => multipleInitialFilters?.[attribute.id].map(filter => filter.value))
                          .join(",");

                const options = props.auto ? attributes?.flatMap(mapAttributeToValues) ?? [] : parsedOptions;

                const filterComponentReturned = (
                    <FilterComponentPlus
                        ariaLabel={props.ariaLabel?.value}
                        className={props.class}
                        defaultValue={defaultValues ? defaultValues : props.defaultValue?.value}
                        emptyOptionCaption={props.emptyOptionCaption?.value}
                        multiSelect={props.multiSelect}
                        id={id.current}
                        options={options}
                        styles={props.style}
                        tabIndex={props.tabIndex}
                        updateFilters={(values: FilterOptionPlus[]): void => {
                            const valuesString = values.map(v => v.value).join(",");
                            const attributeCurrentValue = props.valueAttribute?.value || "";
                            if (valuesString !== attributeCurrentValue) {
                                props.valueAttribute?.setValue(valuesString);
                                props.onChange?.execute();
                            }
                            const conditions = attributes
                                ?.map(attribute => getFilterCondition(attribute, values))
                                .filter((filter): filter is FilterCondition => filter !== undefined);
                            filterDispatcher({
                                getFilterCondition: () =>
                                    conditions && conditions.length > 1 ? or(...conditions) : conditions?.[0],
                                filterType: NoLimitFilterType.ENUMERATION,
                                key: props.name
                            });
                        }}
                    />
                );

                return filterComponentReturned;

                // return (
                //     <FilterComponentPlus
                //         ariaLabel={props.ariaLabel?.value}
                //         className={props.class}
                //         defaultValue={defaultValues ? defaultValues : props.defaultValue?.value}
                //         emptyOptionCaption={props.emptyOptionCaption?.value}
                //         multiSelect={props.multiSelect}
                //         id={id.current}
                //         options={options}
                //         styles={props.style}
                //         tabIndex={props.tabIndex}
                //         updateFilters={(values: FilterOptionPlus[]): void => {
                //             const valuesString = values.map(v => v.value).join(",");
                //             const attributeCurrentValue = props.valueAttribute?.value || "";
                //             if (valuesString !== attributeCurrentValue) {
                //                 props.valueAttribute?.setValue(valuesString);
                //                 props.onChange?.execute();
                //             }
                //             const conditions = attributes
                //                 ?.map(attribute => getFilterCondition(attribute, values))
                //                 .filter((filter): filter is FilterCondition => filter !== undefined);
                //             filterDispatcher({
                //                 getFilterCondition: () =>
                //                     conditions && conditions.length > 1 ? or(...conditions) : conditions?.[0],
                //                 filterType: NoLimitFilterType.ENUMERATION,
                //                 key: props.name
                //             });
                //         }}
                //     />
                // );
            }}
        </FilterContext.Consumer>
    ) : (
        alertMessage
    );
}

// function findAttributesByType(multipleAttributes?: {
//     [key: string]: ListAttributeValue;
// }): ListAttributeValue[] | undefined {
//     if (!multipleAttributes) {
//         return undefined;
//     }
//     return Object.keys(multipleAttributes)
//         .map(key => multipleAttributes[key])
//         .filter(attr => attr.type.match(/Enum|Boolean/));
// }

/**
 * Finds the attribute ("Filter attribute") that a filter widget will be used
 * to filter on by the widget name ("Filter Widget Name"). The filterName
 * is assigned by the developer in the widget properties under Common > Name.
 * This replaces the Mendix-delivered findAttributesByType function that used
 * the type of the filter widget (String, Enum/Boolean, Integer, Datetime)
 * @param multipleAttributes
 * @param filterName
 */
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
            // .filter(attr => attr.type.match(/Enum|Boolean/));
            .filter(attr => attr.filterName === filterName)
            .map(attr => attr.filter)
    );
}

function getAttributeTypeErrorMessage(type?: string): string | null {
    return type && !type.match(/Enum|Boolean/)
        ? "The attribute type being used for Drop-down filter is not 'Boolean or Enumeration'"
        : null;
}

function validateValues(attributes: ListAttributeValue[], options: FilterOptionPlus[]): string | null {
    if (options.length === 0) {
        return null;
    }

    return options.some(filterOption =>
        attributes.every(
            listAttribute => !listAttribute.universe?.includes(checkValue(filterOption.value, listAttribute.type))
        )
    )
        ? "There are invalid values available in the Drop-down filter"
        : null;
}

function getFilterCondition(
    listAttribute: ListAttributeValue | undefined,
    values: FilterOptionPlus[]
): FilterCondition | undefined {
    if (!listAttribute || !listAttribute.filterable || values.length === 0) {
        return undefined;
    }

    const { id, type } = listAttribute;
    const filterAttribute = attribute(id);

    const filters = values
        .filter(filterOption => listAttribute.universe?.includes(checkValue(filterOption.value, listAttribute.type)))
        .map(filter => equals(filterAttribute, literal(checkValue(filter.value, type))));

    if (filters.length > 1) {
        return or(...filters);
    }

    const [filterValue] = filters;
    return filterValue;
}

function checkValue(value: string, type: string): boolean | string {
    if (type === "Boolean") {
        if (value !== "true" && value !== "false") {
            return value;
        }
        return value === "true";
    }
    return value;
}

/**
 *
 * @param attribute
 */
function mapAttributeToValues(attribute: ListAttributeValue): FilterOptionPlus[] {
    if (!attribute.universe) {
        return [];
    }
    return attribute.universe.map(value => ({
        caption: attribute.formatter.format(value) ?? "",
        value: value?.toString() ?? ""
    }));
}
