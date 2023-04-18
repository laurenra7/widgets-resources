import { createElement, ReactElement, useRef } from "react";

import "react-datepicker/dist/react-datepicker.css";
import { FilterPlusComponent } from "./components/FilterPlusComponent";
import { DatagridDateFilterPlusContainerProps, DefaultFilterEnum } from "../typings/DatagridDateFilterPlusProps";
import { registerLocale } from "react-datepicker";
import * as locales from "date-fns/locale";
import {
    Alert,
    generateUUID,
    getNoLimitFilterDispatcher,
    NoLimitFilterType
} from "@mendix/piw-utils-internal/components/web";

import { changeTimeToMidnight } from "./utils/utils";
import { addDays, isEqual } from "date-fns";

import {
    and,
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
import { RangeDateValue } from "./components/DatePickerPlus";

interface Locale {
    [key: string]: object;
}

export default function DatagridDateFilter(props: DatagridDateFilterPlusContainerProps): ReactElement | null {
    const id = useRef(`DateFilter${generateUUID()}`);
    const { languageTag = "en-US", patterns, firstDayOfWeek } = window.mx.session.getConfig().locale;

    const [language] = languageTag.split("-");
    const languageTagWithoutDash = languageTag.replace("-", "");

    if (languageTagWithoutDash in locales) {
        registerLocale(language, (locales as Locale)[languageTagWithoutDash]);
    } else if (language in locales) {
        registerLocale(language, (locales as Locale)[language]);
    }

    const alertMessage = (
        <Alert bootstrapStyle="danger">
            The Date filter widget must be placed inside the header of the Data grid 2.0 or Gallery widget.
        </Alert>
    );
    const alertMessageMultipleFilters = (
        <Alert bootstrapStyle="danger">
            The Date filter widget can&apos;t be used with the filters options you have selected. It requires a
            &quot;Date and Time&quot; attribute to be selected.
        </Alert>
    );

    const FilterContext = getNoLimitFilterDispatcher();

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
                        defaultEndDate={defaultFilter?.endDate ?? props.defaultEndDate?.value}
                        defaultStartDate={defaultFilter?.startDate ?? props.defaultStartDate?.value}
                        defaultValue={defaultFilter?.value ?? props.defaultValue?.value}
                        dateFormat={patterns.date}
                        locale={language}
                        id={id.current}
                        placeholder={props.placeholder?.value}
                        screenReaderButtonCaption={props.screenReaderButtonCaption?.value}
                        screenReaderCalendarCaption={props.screenReaderCalendarCaption?.value}
                        screenReaderInputCaption={props.screenReaderInputCaption?.value}
                        styles={props.style}
                        tabIndex={props.tabIndex}
                        calendarStartDay={firstDayOfWeek}
                        updateFilters={(
                            value: Date | undefined,
                            rangeValues: RangeDateValue,
                            type: DefaultFilterEnum
                        ): void => {
                            let shouldExecuteOnChange = false;
                            if (type === "between") {
                                const [startDate, endDate] = rangeValues;
                                if (
                                    (startDate &&
                                        props.startDateAttribute?.value &&
                                        !isEqual(props.startDateAttribute.value, startDate)) ||
                                    startDate !== props.startDateAttribute?.value
                                ) {
                                    props.startDateAttribute?.setValue(startDate);
                                    shouldExecuteOnChange = true;
                                }
                                if (
                                    (endDate &&
                                        props.endDateAttribute?.value &&
                                        !isEqual(props.endDateAttribute.value, endDate)) ||
                                    endDate !== props.endDateAttribute?.value
                                ) {
                                    props.endDateAttribute?.setValue(endDate);
                                    shouldExecuteOnChange = true;
                                }
                            } else if (
                                (value && props.valueAttribute?.value && !isEqual(props.valueAttribute.value, value)) ||
                                value !== props.valueAttribute?.value
                            ) {
                                props.valueAttribute?.setValue(value);
                                shouldExecuteOnChange = true;
                            }

                            let filterAttribute = props.filterAttribute?.value || "";
                            if (props.defaultFilter == "useSavedFilter" && type && type !== filterAttribute) {
                                switch (type) {
                                    case "between":
                                    case "greater":
                                    case "greaterEqual":
                                    case "equal":
                                    case "notEqual":
                                    case "smaller":
                                    case "smallerEqual":
                                    case "empty":
                                    case "notEmpty":
                                        props.filterAttribute?.setValue(type);
                                        shouldExecuteOnChange = true;
                                        break;
                                }
                            }

                            if (shouldExecuteOnChange) {
                                props.onChange?.execute();
                            }

                            const conditions = attributes
                                ?.map(attribute => getFilterCondition(attribute, value, rangeValues, type))
                                .filter((filter): filter is FilterCondition => filter !== undefined);
                            filterDispatcher({
                                getFilterCondition: () =>
                                    conditions && conditions.length > 1 ? or(...conditions) : conditions?.[0],
                                filterType: NoLimitFilterType.DATE,
                                key: props.name
                            });
                        }}
                    />
                );
            }}
        </FilterContext.Consumer>
    ) : (
        alertMessage
    );
}

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
    return Object.keys(multipleAttributes)
        .map(key => multipleAttributes[key])
        .filter(attr => attr.filterName === filterName)
        .map(attr => attr.filter);
}

function getAttributeTypeErrorMessage(type?: string): string | null {
    return type && type !== "DateTime" ? "The attribute type being used for Date filter is not 'Date and time'" : null;
}

function getFilterCondition(
    listAttribute: ListAttributeValue,
    value: Date | undefined,
    rangeValues: RangeDateValue,
    type: DefaultFilterEnum
): FilterCondition | undefined {
    if (
        !listAttribute ||
        !listAttribute.filterable ||
        (type !== "between" && type !== "empty" && type !== "notEmpty" && !value) ||
        (type === "between" && (!rangeValues || !rangeValues[0] || !rangeValues[1]))
    ) {
        return undefined;
    }

    const filterAttribute = attribute(listAttribute.id);

    if (type === "between") {
        const startDate = changeTimeToMidnight(rangeValues![0]!);
        const endDate = changeTimeToMidnight(rangeValues![1]!);
        return and(
            greaterThanOrEqual(filterAttribute, literal(startDate)),
            lessThanOrEqual(filterAttribute, literal(new Date(addDays(endDate, 1).getTime() - 1)))
        );
    }
    if (type === "empty") {
        return equals(filterAttribute, literal(undefined));
    }
    if (type === "notEmpty") {
        return notEqual(filterAttribute, literal(undefined));
    }

    const dateValue = changeTimeToMidnight(value!);
    switch (type) {
        case "greater":
            // > Day +1 at midnight -1ms
            return greaterThan(filterAttribute, literal(new Date(addDays(dateValue, 1).getTime() - 1)));
        case "greaterEqual":
            // >= day at midnight
            return greaterThanOrEqual(filterAttribute, literal(dateValue));
        case "equal":
            // >= day at midnight and < day +1 midnight
            return and(
                greaterThanOrEqual(filterAttribute, literal(dateValue)),
                lessThan(filterAttribute, literal(addDays(dateValue, 1)))
            );
        case "notEqual":
            // < day at midnight or >= day +1 at midnight
            return or(
                lessThan(filterAttribute, literal(dateValue)),
                greaterThanOrEqual(filterAttribute, literal(addDays(dateValue, 1)))
            );
        case "smaller":
            // < day at midnight
            return lessThan(filterAttribute, literal(dateValue));
        case "smallerEqual":
            // <= day +1 at midnight -1ms
            return lessThanOrEqual(filterAttribute, literal(new Date(addDays(dateValue, 1).getTime() - 1)));
    }
}