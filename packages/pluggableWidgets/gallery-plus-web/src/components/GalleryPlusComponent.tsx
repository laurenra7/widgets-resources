import { createElement, ReactElement, ReactNode } from "react";
import { InfiniteBody, Pagination } from "@mendix/piw-utils-internal/components/web";
import { ObjectItem } from "mendix";
import classNames from "classnames";
import "./gallery-plus.css";

export interface GalleryPlusComponentProps<T extends ObjectItem> {
    className?: string;
    desktopItems: number;
    emptyPlaceholderRenderer?: (renderWrapper: (children: ReactNode) => ReactElement) => ReactElement;
    emptyMessageTitle?: string;
    filters?: ReactNode;
    filtersTitle?: string;
    hasMoreItems: boolean;
    items: T[];
    itemRenderer: (
        renderWrapper: (children: ReactNode, className?: string, onClick?: () => void) => ReactElement,
        item: T
    ) => ReactNode;
    numberOfItems?: number;
    paging: boolean;
    page: number;
    pageSize: number;
    paginationPosition?: "below" | "above" | "both";
    preview?: boolean;
    phoneItems: number;
    setPage?: (computePage: (prevPage: number) => number) => void;
    tabletItems: number;
    tabIndex?: number;
}

export function GalleryPlusComponent<T extends ObjectItem>(props: GalleryPlusComponentProps<T>): ReactElement {
    const pagination = props.paging ? (
        <div className="widget-gallery-plus-pagination">
            <Pagination
                canNextPage={props.hasMoreItems}
                canPreviousPage={props.page !== 0}
                gotoPage={(page: number) => props.setPage && props.setPage(() => page)}
                nextPage={() => props.setPage && props.setPage(prev => prev + 1)}
                numberOfItems={props.numberOfItems}
                page={props.page}
                pageSize={props.pageSize}
                previousPage={() => props.setPage && props.setPage(prev => prev - 1)}
            />
        </div>
    ) : null;

    const pagination_bottom = props.paging ? (
        <div className="widget-gallery-plus-pagination-bottom">
            <Pagination
                canNextPage={props.hasMoreItems}
                canPreviousPage={props.page !== 0}
                gotoPage={(page: number) => props.setPage && props.setPage(() => page)}
                nextPage={() => props.setPage && props.setPage(prev => prev + 1)}
                numberOfItems={props.numberOfItems}
                page={props.page}
                pageSize={props.pageSize}
                previousPage={() => props.setPage && props.setPage(prev => prev - 1)}
            />
        </div>
    ) : null;

    return (
        <div className={classNames("widget-gallery", props.className)} data-focusindex={props.tabIndex || 0}>
            {(props.paginationPosition === "above" || props.paginationPosition === "both") && pagination}
            <div className="widget-gallery-plus-filter" role="section" aria-label={props.filtersTitle}>
                {props.filters}
            </div>

            {props.items.length > 0 && props.itemRenderer && (
                <InfiniteBody
                    className={classNames(
                        "widget-gallery-plus-items",
                        `widget-gallery-plus-lg-${props.desktopItems}`,
                        `widget-gallery-plus-md-${props.tabletItems}`,
                        `widget-gallery-plus-sm-${props.phoneItems}`
                    )}
                    hasMoreItems={props.hasMoreItems}
                    setPage={props.setPage}
                    isInfinite={!props.paging}
                    role="list"
                >
                    {props.items.map(item =>
                        props.itemRenderer((children, className, onClick) => {
                            return (
                                <div
                                    key={`item_${item.id}`}
                                    className={classNames("widget-gallery-plus-item", className, {
                                        "widget-gallery-plus-clickable": !!onClick
                                    })}
                                    onClick={onClick}
                                    onKeyDown={
                                        onClick
                                            ? e => {
                                                  if (e.key === "Enter" || e.key === " ") {
                                                      e.preventDefault();
                                                      onClick();
                                                  }
                                              }
                                            : undefined
                                    }
                                    role={onClick ? "button" : "listitem"}
                                    tabIndex={onClick ? 0 : undefined}
                                >
                                    {children}
                                </div>
                            );
                        }, item)
                    )}
                </InfiniteBody>
            )}
            {(props.items.length === 0 || props.preview) &&
                props.emptyPlaceholderRenderer &&
                props.emptyPlaceholderRenderer(children => (
                    <div className="widget-gallery-plus-empty" role="section" aria-label={props.emptyMessageTitle}>
                        <div className="empty-placeholder">{children}</div>
                    </div>
                ))}
            {(props.paginationPosition === "below" || props.paginationPosition === "both") && pagination_bottom}
        </div>
    );
}
