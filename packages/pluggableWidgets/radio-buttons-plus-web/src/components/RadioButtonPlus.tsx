import { createElement, CSSProperties, ReactElement } from "react";
import { ButtonsListType, OrientationEnum } from "../../typings/RadioButtonsPlusProps";

export interface RadioButtonProps {
    title: string;
    active: boolean;
    onSelect: (value: string) => void;
    styles: CSSProperties | undefined;
    name: string;
    disabled: boolean;
    buttonsList: ButtonsListType[];
    orientation: OrientationEnum;
}

export function RadioButton({
    active,
    onSelect,
    title,
    name,
    disabled,
    orientation,
    buttonsList
}: RadioButtonProps): ReactElement {
    // Determine if a subtext is specified
    let needsSubtext: Boolean;
    let subtextItem: ButtonsListType | undefined = buttonsList.find(obj => {
        return obj.enumName === name;
    });
    if (orientation === "vertical" && subtextItem !== null) {
        needsSubtext = true;
    } else {
        needsSubtext = false;
    }

    // Compile failing on this variable declaration line
    let classname: string;

    if (disabled === true) {
        if (orientation === "horizontal") {
            classname =
                "radio-button-item-container-style radio-button-item-container-horizontal-style radio-button-item-container-disabled-style";
        } else {
            classname = "radio-button-item-container-style radio-button-item-container-disabled-style";
        }
    } else {
        if (orientation === "horizontal") {
            classname = "radio-button-item-container-style radio-button-item-container-horizontal-style";
        } else {
            classname = "radio-button-item-container-style";
        }
    }

    // Return different radio buttons based on if there is a specified subtext
    return (
        <button className={classname} onClick={() => onSelect(name)}>
            <label className="circular-button-style">{active && <label className="activeButtonStyle" />}</label>
            {needsSubtext ? (
                <div>
                    <label className="radioButtonItemTitleStyle">{title}</label>
                    <label className="radioButtonItemTitleStyle">{subtextItem?.subtextString}</label>
                </div>
            ) : (
                <label className="radioButtonItemTitleStyle">{title}</label>
            )}
        </button>
    );
    //  Original code for future reference

    //  if (needsSubtext === true) {
    //     return (
    //         <Pressable
    //             style={[
    //                 styles.radioButtonItemContainerStyle,
    //                 orientation === "horizontal" && styles.radioButtonItemContainerHorizontalStyle,
    //                 disabled && styles.radioButtonItemContainerDisabledStyle
    //             ]}
    //             onPress={() => onSelect(name)}
    //             testID={`radio-button-${name}`}
    //         >
    //             <View style={[styles.circularButtonStyle, disabled && styles.circularBtnDisabledStyle]}>
    //                 {active && <View style={styles.activeButtonStyle} />}
    //             </View>
    //             <Text style={styles.radioButtonItemTitleStyle}>{title}</Text>
    //             <Text style={styles.radioButtonItemTitleStyle}>{subtextItem?.subtextString}</Text>
    //         </Pressable>
    //     );
    // } else {
    //     return (
    //         <Pressable
    //             style={[
    //                 styles.radioButtonItemContainerStyle,
    //                 orientation === "horizontal" && styles.radioButtonItemContainerHorizontalStyle,
    //                 disabled && styles.radioButtonItemContainerDisabledStyle
    //             ]}
    //             onPress={() => onSelect(name)}
    //             testID={`radio-button-${name}`}
    //         >
    //             <View style={[styles.circularButtonStyle, disabled && styles.circularBtnDisabledStyle]}>
    //                 {active && <View style={styles.activeButtonStyle} />}
    //             </View>
    //             <Text style={styles.radioButtonItemTitleStyle}>{title}</Text>
    //         </Pressable>
    //     );
    // }
}
