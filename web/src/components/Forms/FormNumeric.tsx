import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";

type Props = Omit<React.ComponentProps<typeof Form.Control>, 'onChange' | 'value'> & {
    value?: number;
    onChange?: (value: number) => void;
}

const invalidString = ['e', '.']

export const FormNumeric: React.FC<Props> = (props) => {
    const { value, onChange, className, ...rest } = props;
    const [internalValue, setInternalValue] = useState(value?.toString() ?? '');

    useEffect(() => {
        if (!onChange) return
        const validAllValues = !isNaN(parseInt(internalValue))
        if (!validAllValues) return
        if (validAllValues && typeof value === 'number' && value === parseInt(internalValue)) return;
        if (invalidString.some(s => internalValue.includes(s))) return
        onChange(parseInt(internalValue))
    }, [internalValue, onChange])

    useEffect(() => {
        const validAllValues = !isNaN(parseInt(internalValue))
        if (!validAllValues && typeof value !== 'number') return
        if (validAllValues && typeof value === 'number' && value === parseInt(internalValue)) return
        setInternalValue(value?.toString() ?? '')
    }, [value])

    return (
        <Form.Control
            type="number"
            value={internalValue}
            onChange={(e) => setInternalValue(e.target.value)}
            className={`${isNaN(parseInt(internalValue)) || invalidString.some(s => internalValue.includes(s)) ? 'is-invalid' : ''} ${className}`}
            {...rest}
        />
    );
}; 