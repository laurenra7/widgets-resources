import { createElement, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GalleryPlusContainerProps } from "../typings/GalleryPlusProps";
import { GalleryPlusComponent as GalleryPlusComponent } from "./components/GalleryPlusComponent";
import {
    FilterType,
    SortInstruction,
    SortFunction,
    useFilterContext,
    useMultipleFiltering,
    useSortContext
} from "@mendix/piw-utils-internal/components/web";
import { FilterCondition } from "mendix/filters";
import { extractFilters } from "./utils/filters";
import { and } from "mendix/filters/builders";
import { executeAction } from "@mendix/piw-utils-internal";

export function GalleryPlus(props: GalleryPlusContainerProps): ReactElement {
    const viewStateFilters = useRef<FilterCondition | undefined>(undefined);
    const viewStateSort = useRef<SortInstruction[] | undefined>(undefined);
    const [filtered, setFiltered] = useState(false);
    const [sorted, setSorted] = useState(false);
    const customFiltersState = useMultipleFiltering();
    const [sortState, setSortState] = useState<SortFunction>();
    const { FilterContext } = useFilterContext();
    const { SortContext } = useSortContext();
    const isInfiniteLoad = props.pagination === "virtualScrolling";
    const currentPage = isInfiniteLoad
        ? props.datasource.limit / props.pageSize
        : props.datasource.offset / props.pageSize;

    useEffect(() => {
        props.datasource.requestTotalCount(true);
        if (props.datasource.limit === Number.POSITIVE_INFINITY) {
            props.datasource.setLimit(props.pageSize);
        }
    }, [props.datasource, props.pageSize]);

    useEffect(() => {
        if (props.datasource.filter && !filtered && !viewStateFilters.current) {
            viewStateFilters.current = props.datasource.filter;
        }
        if (props.datasource.sortOrder && !sorted && !viewStateSort.current) {
            viewStateSort.current = props.datasource.sortOrder;
        }
    }, [props.datasource, filtered, sorted]);

    const filterList = useMemo(
        () => props.filterList.reduce((filters, { filter }) => ({ ...filters, [filter.id]: filter }), {}),
        [props.filterList]
    );

    const sortList = useMemo(
        () =>
            props.sortList.map(({ attribute, caption }) => ({
                attribute,
                caption: caption.value ?? ""
            })),
        [props.sortList]
    );

    const initialFilters = useMemo(
        () =>
            props.filterList.reduce(
                (filters, { filter }) => ({
                    ...filters,
                    [filter.id]: extractFilters(filter, viewStateFilters.current)
                }),
                {}
            ),
        [props.filterList, viewStateFilters.current]
    );

    const filters = Object.keys(customFiltersState)
        .map((key: FilterType) => customFiltersState[key][0]?.getFilterCondition())
        .filter((filter): filter is FilterCondition => filter !== undefined);

    if (filters.length > 0) {
        props.datasource.setFilter(filters.length > 1 ? and(...filters) : filters[0]);
    } else if (filtered) {
        props.datasource.setFilter(undefined);
    } else {
        props.datasource.setFilter(viewStateFilters.current);
    }

    if (sortState && "getSortCondition" in sortState) {
        const sortCondition = sortState.getSortCondition();
        props.datasource.setSortOrder(sortCondition ? [sortCondition] : undefined);
    } else {
        props.datasource.setSortOrder(undefined);
    }

    const isSortableFilterable = props.filterList.length > 0 || props.sortList.length > 0;

    const setPage = useCallback(
        computePage => {
            const newPage = computePage(currentPage);
            if (isInfiniteLoad) {
                props.datasource.setLimit(newPage * props.pageSize);
            } else {
                props.datasource.setOffset(newPage * props.pageSize);
            }
        },
        [props.datasource, props.pageSize, isInfiniteLoad, currentPage]
    );

    return (
        <GalleryPlusComponent
            className={props.class}
            desktopItems={props.desktopItems}
            emptyPlaceholderRenderer={useCallback(
                renderWrapper =>
                    props.showEmptyPlaceholder === "custom" ? renderWrapper(props.emptyPlaceholder) : <div />,
                [props.emptyPlaceholder, props.showEmptyPlaceholder]
            )}
            emptyMessageTitle={props.emptyMessageTitle?.value}
            filters={useMemo(
                () =>
                    isSortableFilterable ? (
                        <FilterContext.Provider
                            value={{
                                filterDispatcher: prev => {
                                    if (prev.filterType) {
                                        const [, filterDispatcher] = customFiltersState[prev.filterType];
                                        filterDispatcher(prev);
                                        setFiltered(true);
                                    }
                                    return prev;
                                },
                                multipleAttributes: filterList,
                                multipleInitialFilters: initialFilters
                            }}
                        >
                            <SortContext.Provider
                                value={{
                                    sortDispatcher: prev => {
                                        setSorted(true);
                                        setSortState(prev);
                                        return prev;
                                    },
                                    attributes: sortList,
                                    initialSort: viewStateSort.current
                                }}
                            >
                                {props.filtersPlaceholder}
                            </SortContext.Provider>
                        </FilterContext.Provider>
                    ) : null,
                [
                    FilterContext,
                    SortContext,
                    customFiltersState,
                    filterList,
                    initialFilters,
                    isSortableFilterable,
                    props.filtersPlaceholder,
                    sortList
                ]
            )}
            filtersTitle={props.filterSectionTitle?.value}
            hasMoreItems={props.datasource.hasMoreItems ?? false}
            items={props.datasource.items ?? []}
            itemRenderer={useCallback(
                (renderWrapper, item) =>
                    renderWrapper(
                        props.content?.get(item),
                        props.itemClass?.get(item)?.value,
                        props.onClick ? () => executeAction(props.onClick?.get(item)) : undefined
                    ),
                [props.content, props.itemClass, props.onClick]
            )}
            numberOfItems={props.datasource.totalCount}
            page={currentPage}
            pageSize={props.pageSize}
            paging={props.pagination === "buttons"}
            paginationPosition={props.pagingPosition}
            phoneItems={props.phoneItems}
            setPage={setPage}
            tabletItems={props.tabletItems}
            tabIndex={props.tabIndex}
        />
    );
}
