import { createElement, ReactElement, useCallback } from "react";
import { GalleryPlusPreviewProps } from "../typings/GalleryPlusProps";
import { GalleryPlusComponent as GalleryPlusComponent } from "./components/GalleryPlusComponent";
import { ObjectItem, GUID } from "mendix";

export function preview(props: GalleryPlusPreviewProps): ReactElement {
    const items: ObjectItem[] = Array.from({ length: props.pageSize ?? 5 }).map((_, index) => ({
        id: String(index) as GUID
    }));
    const caption =
        props.filterList.length > 0
            ? props.sortList.length > 0
                ? "Place filter/sort widgets here"
                : "Place filter widgets here"
            : props.sortList.length > 0
            ? "Place sort widgets here"
            : "Place widgets here";
    const isSortableFilterable = props.filterList.length > 0 || props.sortList.length > 0;
    return (
        <GalleryPlusComponent
            className={props.className}
            desktopItems={props.desktopItems!}
            emptyPlaceholderRenderer={useCallback(
                renderWrapper => (
                    <props.emptyPlaceholder.renderer caption="Empty list message: Place widgets here">
                        {renderWrapper(null)}
                    </props.emptyPlaceholder.renderer>
                ),
                [props.emptyPlaceholder]
            )}
            filters={
                isSortableFilterable ? (
                    <props.filtersPlaceholder.renderer caption={caption}>
                        <div />
                    </props.filtersPlaceholder.renderer>
                ) : null
            }
            hasMoreItems={false}
            items={items}
            itemRenderer={useCallback(
                renderWrapper => (
                    <props.content.renderer caption="Gallery item: Place widgets here">
                        {renderWrapper(null, "")}
                    </props.content.renderer>
                ),
                [props.content]
            )}
            numberOfItems={items.length}
            page={0}
            pageSize={props.pageSize ?? 5}
            paging={props.pagination === "buttons"}
            paginationPosition={props.pagingPosition}
            preview
            phoneItems={props.phoneItems!}
            tabletItems={props.tabletItems!}
        />
    );
}
