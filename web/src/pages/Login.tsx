import React, { useEffect, useRef, useState } from "react"
import { Button, Col, Container, Form, Row } from "react-bootstrap"
import axios from "axios"
import { useStore } from "@/hooks/useStore"

export const Login: React.FC = () => {
    const setLoged = useStore(state => state.setLoged)

    const passInput = useRef<HTMLInputElement>(null)
    const [password, setPassword] = useState('')

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        axios.post('/api/login', {
            password
        })
            .then(() => {
                setLoged(true)
            })
            .catch((e) => {
                console.log(e)
            })
    }

    useEffect(() => {
        passInput.current?.focus()
    }, [])

    return (
        <Container>
            <Row className="justify-content-md-center mt-5">
                <Col sm={12} md={6}>
                    <h1>Minecraft Legion Dashboard</h1>
                    <Form className="mt-3" onSubmit={handleLogin}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control ref={passInput} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Login
                        </Button>
                    </Form>
                    <div className="mt-3">
                        Contribute in <a href="https://github.com/sefirosweb/minecraftLegion" target="_blank">GitHub</a>
                    </div>
                    <div>
                        <a href="https://www.buymeacoffee.com/sefirosweb" target="_blank">
                            <img
                                src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png"
                                alt="&quot;Buy Me A Coffee&quot;"
                                data-canonical-src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png"
                            />
                        </a>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}