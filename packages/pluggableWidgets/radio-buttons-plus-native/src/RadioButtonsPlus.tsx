import { createElement, useCallback, ReactElement } from "react";
import { Text, View } from "react-native";

import { mergeNativeStyles } from "@mendix/pluggable-widgets-tools";
import { executeAction } from "@mendix/piw-utils-internal";

import { RadioButton } from "./components/RadioButtonPlus";
import { RadioButtonsPlusProps } from "../typings/RadioButtonsPlusProps";
import { defaultRadioButtonsStyle, RadioButtonsStyle } from "./ui/Styles";

export type props = RadioButtonsPlusProps<RadioButtonsStyle>;

export function RadioButtons({
    enum: { setValue, universe, value, formatter, readOnly, validation },
    orientation,
    style,
    onChange,
    name,
    label,
    showLabel,
    buttonsList
}: props): ReactElement {
    const styles = mergeNativeStyles(defaultRadioButtonsStyle, style);
    const onSelect = useCallback(
        (selectedValue: string) => {
            if (selectedValue === value || readOnly) {
                return;
            }
            setValue(selectedValue);
            executeAction(onChange);
        },
        [onChange, readOnly, setValue, value]
    );

    return (
        <View testID={name} style={styles.container}>
            {showLabel && <Text style={styles.labelTextStyle}>{label?.value}</Text>}
            <View style={orientation === "horizontal" && styles.containerHorizontal}>
                {universe?.map(name => (
                    <RadioButton
                        key={name}
                        active={value === name}
                        onSelect={onSelect}
                        title={formatter.format(name)}
                        styles={styles}
                        name={name}
                        disabled={readOnly}
                        orientation={orientation}
                        buttonsList={buttonsList}
                    />
                ))}
            </View>
            {validation && <Text style={styles.validationMessage}>{validation}</Text>}
        </View>
    );
}
