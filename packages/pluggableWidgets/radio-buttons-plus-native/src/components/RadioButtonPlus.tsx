import { createElement, ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import { RadioButtonsStyle } from "../ui/Styles";
import { ButtonsListType, OrientationEnum } from "../../typings/RadioButtonsPlusProps";

export interface RadioButtonProps {
    title: string;
    active: boolean;
    onSelect: (value: string) => void;
    styles: RadioButtonsStyle;
    name: string;
    disabled: boolean;
    buttonsList: ButtonsListType[];
    orientation: OrientationEnum;
}

export function RadioButton({
    active,
    onSelect,
    title,
    styles,
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

    // Return different rasio buttons based on if there is a specified subtext
    return (
        <Pressable
            style={[
                styles.radioButtonItemContainerStyle,
                orientation === "horizontal" && styles.radioButtonItemContainerHorizontalStyle,
                disabled && styles.radioButtonItemContainerDisabledStyle
            ]}
            onPress={() => onSelect(name)}
            testID={`radio-button-${name}`}
        >
            <View style={[styles.circularButtonStyle, disabled && styles.circularBtnDisabledStyle]}>
                {active && <View style={styles.activeButtonStyle} />}
            </View>
            {needsSubtext ? (
                <div>
                    <Text style={styles.radioButtonItemTitleStyle}>{title}</Text>
                    <Text style={styles.radioButtonItemTitleStyle}>{subtextItem?.subtextString}</Text>
                </div>
            ) : (
                <Text style={styles.radioButtonItemTitleStyle}>{title}</Text>
            )}
        </Pressable>
    );
    // if (needsSubtext === true) {
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
