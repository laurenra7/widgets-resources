import { createElement } from "react";
import { mount, render, shallow } from "enzyme";
import { GalleryPlusComponent, GalleryPlusComponentProps } from "../GalleryPlusComponent";
import { ObjectItem, GUID } from "mendix";

const itemWrapperFunction =
    ({
        onClick,
        customClass
    }: {
        onClick?: () => void;
        customClass?: string;
    }): GalleryPlusComponentProps<ObjectItem>["itemRenderer"] =>
    (wrapper, item) =>
        wrapper(item.id, customClass, onClick);

const defaultProps: GalleryPlusComponentProps<ObjectItem> = {
    hasMoreItems: false,
    page: 0,
    pageSize: 10,
    paging: false,
    phoneItems: 2,
    tabletItems: 3,
    desktopItems: 4,
    className: "",
    items: [{ id: "11" as GUID }, { id: "22" as GUID }, { id: "33" as GUID }],
    itemRenderer: itemWrapperFunction({})
};

describe("Gallery", () => {
    describe("DOM Structure", () => {
        it("renders correctly", () => {
            const gallery = render(<GalleryPlusComponent {...defaultProps} />);

            expect(gallery).toMatchSnapshot();
        });

        it("renders correctly with onclick event", () => {
            const gallery = render(
                <GalleryPlusComponent {...defaultProps} itemRenderer={itemWrapperFunction({ onClick: jest.fn() })} />
            );

            expect(gallery).toMatchSnapshot();
        });
    });

    describe("with events", () => {
        it("triggers correct events on click", () => {
            const onClick = jest.fn();
            const gallery = mount(
                <GalleryPlusComponent {...defaultProps} itemRenderer={itemWrapperFunction({ onClick })} />
            );
            const galleryFirstItem = gallery.find(".widget-gallery-plus-clickable").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("click");

            expect(onClick).toBeCalled();
        });

        it("triggers correct events on Enter key down", () => {
            const onClick = jest.fn();
            const gallery = mount(
                <GalleryPlusComponent {...defaultProps} itemRenderer={itemWrapperFunction({ onClick })} />
            );
            const galleryFirstItem = gallery.find(".widget-gallery-plus-clickable").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("keydown", { key: "Enter" });

            expect(onClick).toBeCalled();
        });

        it("triggers correct events on Space key down", () => {
            const onClick = jest.fn();
            const gallery = mount(
                <GalleryPlusComponent {...defaultProps} itemRenderer={itemWrapperFunction({ onClick })} />
            );
            const galleryFirstItem = gallery.find(".widget-gallery-plus-clickable").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("keydown", { key: " " });

            expect(onClick).toBeCalled();
        });
    });

    describe("with different configurations per platform", () => {
        it("contains correct classes for desktop", () => {
            const gallery = shallow(<GalleryPlusComponent {...defaultProps} desktopItems={12} />);

            expect(gallery.find(".widget-gallery-plus-items").hasClass("widget-gallery-plus-lg-12")).toBeTruthy();
        });

        it("contains correct classes for tablet", () => {
            const gallery = shallow(<GalleryPlusComponent {...defaultProps} tabletItems={6} />);

            expect(gallery.find(".widget-gallery-plus-items").hasClass("widget-gallery-plus-md-6")).toBeTruthy();
        });

        it("contains correct classes for phone", () => {
            const gallery = shallow(<GalleryPlusComponent {...defaultProps} phoneItems={3} />);

            expect(gallery.find(".widget-gallery-plus-items").hasClass("widget-gallery-plus-sm-3")).toBeTruthy();
        });
    });

    describe("with custom classes", () => {
        it("contains correct classes in the wrapper", () => {
            const gallery = shallow(<GalleryPlusComponent {...defaultProps} className="custom-class" />);

            expect(gallery.hasClass("custom-class")).toBeTruthy();
        });

        it("contains correct classes in the items", () => {
            const gallery = shallow(
                <GalleryPlusComponent
                    {...defaultProps}
                    itemRenderer={itemWrapperFunction({ customClass: "custom-class" })}
                />
            );
            const galleryFirstItem = gallery.find(".widget-gallery-plus-item").at(0);

            expect(galleryFirstItem.hasClass("custom-class")).toBeTruthy();
        });
    });

    describe("with pagination", () => {
        it("renders correctly", () => {
            const gallery = render(
                <GalleryPlusComponent
                    {...defaultProps}
                    paging
                    paginationPosition="above"
                    numberOfItems={20}
                    hasMoreItems
                />
            );

            expect(gallery).toMatchSnapshot();
        });

        it("triggers correct events on click next button", () => {
            const setPage = jest.fn();
            const gallery = mount(
                <GalleryPlusComponent
                    {...defaultProps}
                    paging
                    paginationPosition="above"
                    numberOfItems={20}
                    hasMoreItems
                    setPage={setPage}
                />
            );
            const galleryFirstItem = gallery.find(".glyphicon-step-forward").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("click");

            expect(setPage).toBeCalled();
        });
    });

    describe("with empty option", () => {
        it("renders correctly", () => {
            const gallery = render(
                <GalleryPlusComponent
                    {...defaultProps}
                    items={[]}
                    emptyPlaceholderRenderer={renderWrapper => renderWrapper(<span>No items found</span>)}
                />
            );

            expect(gallery).toMatchSnapshot();
        });
    });

    describe("with accessibility properties", () => {
        it("renders correctly", () => {
            const gallery = render(
                <GalleryPlusComponent
                    {...defaultProps}
                    items={[]}
                    filtersTitle="filter title"
                    emptyMessageTitle="empty message"
                    emptyPlaceholderRenderer={renderWrapper => renderWrapper(<span>No items found</span>)}
                />
            );

            expect(gallery).toMatchSnapshot();
        });
    });
});
