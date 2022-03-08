import { Context, createContext, Dispatch, SetStateAction, useState } from "react";
import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";

export type NoLimitFilterValue = { type: string; value: any };

export const enum NoLimitFilterType {
    STRING = "string",
    NUMBER = "number",
    ENUMERATION = "enum",
    DATE = "date"
}

export interface NoLimitFilterFunction {
    getFilterCondition: () => FilterCondition | undefined;
    filterType?: NoLimitFilterType;
    key: number;
}

interface NoLimitFilterContainer {
    [key: number]: NoLimitFilterFunction;
}

export interface NoLimitFilterContextValue {
    filterDispatcher: Dispatch<NoLimitFilterFunction>;
    singleAttribute?: ListAttributeValue;
    multipleAttributes?: { [id: string]: { filter: ListAttributeValue; filterName: string } };
    singleInitialFilter?: NoLimitFilterValue[];
    multipleInitialFilters?: { [id: string]: NoLimitFilterValue[] };
}

export function getNoLimitFilterDispatcher(): Context<NoLimitFilterContextValue> | undefined {
    return (window as any)["com.mendix.widgets.web.filterable.filterContext"] as Context<NoLimitFilterContextValue>;
}

export function useNoLimitFilterContext(): { FilterContext: Context<NoLimitFilterContextValue> } {
    const globalFilterContext = getNoLimitFilterDispatcher();
    if (globalFilterContext) {
        return { FilterContext: globalFilterContext };
    }

    const FilterContext = createContext(undefined as any as NoLimitFilterContextValue);

    (window as any)["com.mendix.widgets.web.filterable.filterContext"] = FilterContext;
    return { FilterContext };
}

export function useNoLimitMultipleFiltering(): {
    [key: string]: [NoLimitFilterFunction | undefined, Dispatch<SetStateAction<NoLimitFilterFunction | undefined>>];
} {
    return {
        [NoLimitFilterType.STRING]: useState<NoLimitFilterFunction>(),
        [NoLimitFilterType.NUMBER]: useState<NoLimitFilterFunction>(),
        [NoLimitFilterType.DATE]: useState<NoLimitFilterFunction>(),
        [NoLimitFilterType.ENUMERATION]: useState<NoLimitFilterFunction>()
    };
}

export function useNoLimitFiltering(): [
    NoLimitFilterContainer | undefined,
    Dispatch<SetStateAction<NoLimitFilterContainer | undefined>>
] {
    return useState<NoLimitFilterContainer>({});
}
