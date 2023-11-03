import React from 'react';
import { Form } from 'react-bootstrap';

type Props = {
    id: string
    checked: boolean
    label: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    className?: string
}

export const FormCheck: React.FC<Props> = (props) => {
    const { id, checked, label, onChange, className } = props
    return (
        <Form.Check
            type="switch"
            id={id}
            checked={checked}
            label={label}
            onChange={onChange}
        />
    )
}
