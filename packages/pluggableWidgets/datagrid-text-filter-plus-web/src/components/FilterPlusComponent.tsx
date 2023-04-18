import { createElement, CSSProperties, ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { FilterSelector } from "@mendix/piw-utils-internal/components/web";
import { debounce } from "@mendix/piw-utils-internal";

import { DefaultFilterEnum } from "../../typings/DatagridTextFilterPlusProps";
import classNames from "classnames";

interface FilterPlusComponentProps {
    adjustable: boolean;
    className?: string;
    defaultFilter: DefaultFilterEnum;
    savedFilter: string;
    delay: number;
    id?: string;
    placeholder?: string;
    tabIndex?: number;
    screenReaderButtonCaption?: string;
    screenReaderInputCaption?: string;
    styles?: CSSProperties;
    updateFilters?: (value: string, type: DefaultFilterEnum) => void;
    value?: string;
}

export function FilterPlusComponent(props: FilterPlusComponentProps): ReactElement {
    const [type, setType] = useState<DefaultFilterEnum>(
        props.defaultFilter == "useSavedFilter" ? (props.savedFilter as DefaultFilterEnum) : props.defaultFilter
    );
    const [value, setValue] = useState("");
    const [valueInput, setValueInput] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (props.value) {
            setValueInput(props.value ?? "");
            setValue(props.value ?? "");
        }
    }, [props.value]);

    useEffect(() => {
        props.updateFilters?.(value, type);
    }, [value, type]);

    const onChange = useCallback(
        debounce((value: string) => setValue(value), props.delay),
        [props.delay]
    );

    const focusInput = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef]);

    return (
        <div
            className={classNames("filter-container", props.className)}
            data-focusindex={props.tabIndex ?? 0}
            style={props.styles}
        >
            {props.adjustable && (
                <FilterSelector
                    ariaLabel={props.screenReaderButtonCaption}
                    id={props.id}
                    defaultFilter={props.defaultFilter == "useSavedFilter" ? props.savedFilter : props.defaultFilter}
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
                            { value: "contains", label: "Contains" },
                            { value: "startsWith", label: "Starts with" },
                            { value: "endsWith", label: "Ends with" },
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
            <input
                aria-label={props.screenReaderInputCaption}
                className={classNames("form-control", { "filter-input": props.adjustable })}
                disabled={type === "empty" || type === "notEmpty"}
                onChange={e => {
                    setValueInput(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={props.placeholder}
                ref={inputRef}
                type="text"
                value={valueInput}
            />
        </div>
    );
}