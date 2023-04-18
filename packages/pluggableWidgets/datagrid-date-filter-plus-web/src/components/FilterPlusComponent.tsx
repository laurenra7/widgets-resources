import { createElement, CSSProperties, ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { FilterSelector } from "@mendix/piw-utils-internal/components/web";

import { DefaultFilterEnum } from "../../typings/DatagridDateFilterPlusProps";

import DatePickerComponent from "react-datepicker";
import { DatePickerPlus, RangeDateValue } from "./DatePickerPlus";
import classNames from "classnames";

interface FilterPlusComponentProps {
    adjustable: boolean;
    calendarStartDay?: number;
    className?: string;
    defaultFilter: DefaultFilterEnum;
    savedFilter: string;
    defaultValue?: Date;
    defaultStartDate?: Date;
    defaultEndDate?: Date;
    dateFormat?: string;
    locale?: string;
    id?: string;
    placeholder?: string;
    screenReaderButtonCaption?: string;
    screenReaderCalendarCaption?: string;
    screenReaderInputCaption?: string;
    tabIndex?: number;
    styles?: CSSProperties;
    updateFilters?: (value: Date | undefined, rangeValues: RangeDateValue, type: DefaultFilterEnum) => void;
}

export function FilterPlusComponent(props: FilterPlusComponentProps): ReactElement {
    const [type, setType] = useState<DefaultFilterEnum>(
        props.defaultFilter == "useSavedFilter" ? (props.savedFilter as DefaultFilterEnum) : props.defaultFilter
    );
    const [value, setValue] = useState<Date | undefined>(props.defaultValue);
    const [rangeValues, setRangeValues] = useState<RangeDateValue>([props.defaultStartDate, props.defaultEndDate]);
    const pickerRef = useRef<DatePickerComponent | null>(null);

    useEffect(() => {
        if (props.defaultValue && value?.toISOString() != props.defaultValue.toISOString()) {
            setValue(props.defaultValue);
        }
    }, [props.defaultValue]);

    useEffect(() => {
        if (
            (props.defaultStartDate || props.defaultEndDate) &&
            (rangeValues[0]?.getTime() != props.defaultStartDate?.getTime() ||
                rangeValues[1]?.getTime() != props.defaultEndDate?.getTime())
        ) {
            setRangeValues([props.defaultStartDate, props.defaultEndDate]);
        }
    }, [props.defaultStartDate, props.defaultEndDate]);

    useEffect(() => {
        props.updateFilters?.(value, rangeValues, type);
    }, [value, rangeValues, type]);

    const focusInput = useCallback(() => {
        if (pickerRef.current) {
            pickerRef.current.setFocus();
        }
    }, [pickerRef.current]);

    return (
        <div
            className={classNames("filter-container", props.className)}
            data-focusindex={props.tabIndex ?? 0}
            style={props.styles}
        >
            {props.adjustable && (
                <FilterSelector
                    ariaLabel={props.screenReaderButtonCaption}
                    defaultFilter={props.defaultFilter == "useSavedFilter" ? props.savedFilter : props.defaultFilter}
                    id={props.id}
                    onChange={useCallback(
                        type => {
                            setType(prev => {
                                if (prev === type) {
                                    return prev;
                                }
                                focusInput();
                                return type;
                            });
                        },
                        [focusInput]
                    )}
                    options={
                        [
                            { value: "between", label: "Between" },
                            { value: "greater", label: "Greater than" },
                            { value: "greaterEqual", label: "Greater than or equal" },
                            { value: "equal", label: "Equal" },
                            { value: "notEqual", label: "Not equal" },
                            { value: "smaller", label: "Smaller than" },
                            { value: "smallerEqual", label: "Smaller than or equal" },
                            { value: "empty", label: "Empty" },
                            { value: "notEmpty", label: "Not empty" }
                        ] as Array<{ value: DefaultFilterEnum; label: string }>
                    }
                />
            )}
            <DatePickerPlus
                adjustable={props.adjustable}
                calendarStartDay={props.calendarStartDay}
                dateFormat={props.dateFormat}
                disabledInput={type === "empty" || type === "notEmpty"}
                enableRange={type === "between"}
                locale={props.locale}
                id={props.id}
                placeholder={props.placeholder}
                rangeValues={rangeValues}
                ref={pickerRef}
                screenReaderCalendarCaption={props.screenReaderCalendarCaption}
                screenReaderInputCaption={props.screenReaderInputCaption}
                setRangeValues={setRangeValues}
                setValue={setValue}
                value={value}
            />
        </div>
    );
}