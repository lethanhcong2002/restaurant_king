import React from 'react';
import { TextInput, HelperText } from 'react-native-paper';
import { COLORS } from '../code/color';

function CustomTextInput({
    label,
    value,
    keyboardType = 'default',
    onChangeText,
    onPressIn,
    error,
    helperText,
}) {
    return (
        <>
            <TextInput
                label={label}
                mode="outlined"
                value={value}
                activeOutlineColor={COLORS.primary}
                keyboardType={keyboardType}
                onPressIn={onPressIn}
                onChangeText={onChangeText}
                error={error}
                style={{backgroundColor: COLORS.text_white}}
            />
            {error && <HelperText type="error">{helperText}</HelperText>}
        </>
    );
}

export default CustomTextInput;