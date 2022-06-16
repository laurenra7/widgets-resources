import { createElement, useCallback, ReactElement } from "react";

import { executeAction } from "@mendix/piw-utils-internal";

import { RadioButton } from "./components/RadioButtonPlus";
import { RadioButtonsPlusContainerProps } from "../typings/RadioButtonsPlusProps";

export type props = RadioButtonsPlusContainerProps;

export function RadioButtons({
    enum: { setValue, universe, value, formatter, readOnly, validation },
    orientation,
    style,
    onChange,
    label,
    showLabel,
    buttonsList
}: props): ReactElement {
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
        <div className="container">
            {showLabel && <label className="labelTextStyle">{label?.value}</label>}
            {orientation === "horizontal" ? (
                <div className="radio-button-item-container-horizontal-style">
                    {universe?.map(name => (
                        <RadioButton
                            key={name}
                            active={value === name}
                            onSelect={onSelect}
                            title={formatter.format(name)}
                            styles={style}
                            name={name}
                            disabled={readOnly}
                            orientation={orientation}
                            buttonsList={buttonsList}
                        />
                    ))}
                </div>
            ) : (
                <div className="radio-button-item-container-style">
                    {universe?.map(name => (
                        <RadioButton
                            key={name}
                            active={value === name}
                            onSelect={onSelect}
                            title={formatter.format(name)}
                            styles={style}
                            name={name}
                            disabled={readOnly}
                            orientation={orientation}
                            buttonsList={buttonsList}
                        />
                    ))}
                </div>
            )}
            {/* <div {orientation === "horizontal" ? className="radio-button-item-container-horizontal-style"}>
                {universe?.map(name => (
                    <RadioButton
                        key={name}
                        active={value === name}
                        onSelect={onSelect}
                        title={formatter.format(name)}
                        styles={style}
                        name={name}
                        disabled={readOnly}
                        orientation={orientation}
                        buttonsList={buttonsList}
                    />
                ))}
            </div> */}
            {validation && <label className="validationMessage">{validation}</label>}
        </div>
        // <View testID={name} style={styles.container}>
        //     {showLabel && <Text style={styles.labelTextStyle}>{label?.value}</Text>}
        //     <View style={orientation === "horizontal" && styles.containerHorizontal}>
        //         {universe?.map(name => (
        //             <RadioButton
        //                 key={name}
        //                 active={value === name}
        //                 onSelect={onSelect}
        //                 title={formatter.format(name)}
        //                 styles={style}
        //                 name={name}
        //                 disabled={readOnly}
        //                 orientation={orientation}
        //                 buttonsList={buttonsList}
        //             />
        //         ))}
        //     </View>
        //     {validation && <Text style={styles.validationMessage}>{validation}</Text>}
        // </View>
    );
}
