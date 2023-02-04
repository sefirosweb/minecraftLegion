import { Col, Form, Row } from 'react-bootstrap';

type Props = {
    id: string
    checked: boolean
    label: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const FormCheck = (props: Props) => {
    const { id, checked, label, onChange } = props
    return (
        <Form>
            <Form.Group
                as={Row}
                className="mb-3"
                controlId="formPlaintextEmail"
            >
                <Form.Label column sm="4">
                    {label}
                </Form.Label>

                <Col sm="8">
                    <Form.Check
                        type="switch"
                        id={id}
                        checked={checked}
                        label={checked === true ? "Yes" : "No"}
                        onChange={onChange}
                    />
                </Col>
            </Form.Group>
        </Form>
    )
}

export default FormCheck;
