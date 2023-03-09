import { render } from "enzyme";
import { createElement } from "react";
import { FilterPlusComponent } from "../FilterPlusComponent";
import ReactDOM from "react-dom";

describe("Filter component", () => {
    beforeAll(() => {
        jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);

        // @ts-ignore
        jest.spyOn(ReactDOM, "createPortal").mockReturnValue((element, node) => {
            return element;
        });
    });

    it("renders correctly", () => {
        const component = render(<FilterPlusComponent adjustable defaultFilter="equal" savedFilter={""} />);

        expect(component).toMatchSnapshot();
    });

    it("renders correctly when not adjustable by user", () => {
        const component = render(<FilterPlusComponent adjustable={false} defaultFilter="equal" savedFilter={""} />);

        expect(component).toMatchSnapshot();
    });

    it("renders correctly with aria labels", () => {
        const component = render(
            <FilterPlusComponent
                adjustable
                screenReaderButtonCaption="my label"
                screenReaderInputCaption="my label"
                defaultFilter="equal"
                savedFilter={""}
            />
        );

        expect(component).toMatchSnapshot();
    });
});
