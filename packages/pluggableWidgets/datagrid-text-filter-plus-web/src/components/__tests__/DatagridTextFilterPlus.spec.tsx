import { Alert, FilterContextValue } from "@mendix/piw-utils-internal/components/web";
import { actionValue, EditableValueBuilder, ListAttributeValueBuilder } from "@mendix/piw-utils-internal";
import { render, fireEvent, screen } from "@testing-library/react";
import { mount } from "enzyme";
import { createContext, createElement } from "react";

import DatagridTextFilterPlus from "../../DatagridTextFilterPlus";

const commonProps = {
    class: "filter-custom-class",
    tabIndex: 0,
    name: "filter-test",
    defaultFilter: "equal" as const,
    adjustable: true,
    advanced: false,
    delay: 1000
};

jest.useFakeTimers();

describe("Text Filter", () => {
    describe("with single instance", () => {
        afterEach(() => {
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });

        describe("with single attribute", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = createContext({
                    filterDispatcher: jest.fn(),
                    singleAttribute: new ListAttributeValueBuilder().withType("String").withFilterable(true).build()
                } as FilterContextValue);
            });

            it("renders correctly", () => {
                const { asFragment } = render(<DatagridTextFilterPlus {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });

            it("triggers attribute and onchange action on change filter value", () => {
                const action = actionValue();
                const attribute = new EditableValueBuilder<string>().build();
                render(<DatagridTextFilterPlus {...commonProps} onChange={action} valueAttribute={attribute} />);

                fireEvent.change(screen.getByRole("textbox"), { target: { value: "B" } });

                jest.advanceTimersByTime(1000);

                expect(action.execute).toBeCalledTimes(1);
                expect(attribute.setValue).toBeCalledWith("B");
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = undefined;
            });
        });

        describe("with multiple attributes", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = createContext({
                    filterDispatcher: jest.fn(),
                    multipleAttributes: {
                        attribute1: {
                            filter: new ListAttributeValueBuilder()
                                .withId("attribute1")
                                .withType("String")
                                .withFilterable(true)
                                .build(),
                            filterName: "Attribute1"
                        },
                        attribute2: {
                            filter: new ListAttributeValueBuilder()
                                .withId("attribute1")
                                .withType("String")
                                .withFilterable(true)
                                .build(),
                            filterName: "Attribute1"
                        }
                    }
                } as FilterContextValue);
            });

            it("renders correctly", () => {
                const { asFragment } = render(<DatagridTextFilterPlus {...commonProps} />);

                expect(asFragment()).toMatchSnapshot();
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = undefined;
            });
        });

        describe("with wrong attribute's type", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = createContext({
                    filterDispatcher: jest.fn(),
                    singleAttribute: new ListAttributeValueBuilder().withType("Decimal").withFilterable(true).build()
                } as FilterContextValue);
            });

            it("renders error message", () => {
                const filter = mount(<DatagridTextFilterPlus {...commonProps} />);

                expect(filter.find(Alert).text()).toBe(
                    "The attribute type being used for Text filter is not 'Hashed string or String'"
                );
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = undefined;
            });
        });

        describe("with wrong multiple attributes' types", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = createContext({
                    filterDispatcher: jest.fn(),
                    multipleAttributes: {
                        attribute1: {
                            filter: new ListAttributeValueBuilder()
                                .withId("attribute1")
                                .withType("Decimal")
                                .withFilterable(true)
                                .build(),
                            filterName: "Attribute1"
                        },
                        attribute2: {
                            filter: new ListAttributeValueBuilder()
                                .withId("attribute1")
                                .withType("Long")
                                .withFilterable(true)
                                .build(),
                            filterName: "Attribute1"
                        }
                    }
                } as FilterContextValue);
            });

            it("renders error message", () => {
                const filter = mount(<DatagridTextFilterPlus {...commonProps} />);

                expect(filter.find(Alert).text()).toBe(
                    'The Text filter widget can\'t be used with the filters options you have selected. It requires a "Hashed string or String" attribute to be selected.'
                );
            });

            afterAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = undefined;
            });
        });

        describe("with no context", () => {
            beforeAll(() => {
                (window as any)["com.mendix.widgets.web.filterable.filterContext"] = undefined;
            });

            it("renders error message", () => {
                const filter = mount(<DatagridTextFilterPlus {...commonProps} />);

                expect(filter.find(Alert).text()).toBe(
                    "The Text filter widget must be placed inside the header of the Data grid 2.0 or Gallery widget."
                );
            });
        });
    });

    describe("with multiple instances", () => {
        beforeAll(() => {
            (window as any)["com.mendix.widgets.web.filterable.filterContext"] = createContext({
                filterDispatcher: jest.fn(),
                singleAttribute: new ListAttributeValueBuilder().withType("String").withFilterable(true).build()
            } as FilterContextValue);
        });

        it("renders with a unique id", () => {
            const { asFragment: fragment1 } = render(<DatagridTextFilterPlus {...commonProps} />);
            const { asFragment: fragment2 } = render(<DatagridTextFilterPlus {...commonProps} />);

            expect(fragment1().querySelector("button")?.getAttribute("aria-controls")).not.toBe(
                fragment2().querySelector("button")?.getAttribute("aria-controls")
            );
        });

        afterAll(() => {
            (window as any)["com.mendix.widgets.web.filterable.filterContext"] = undefined;
            delete (global as any)["com.mendix.widgets.web.UUID"];
        });
    });
});
