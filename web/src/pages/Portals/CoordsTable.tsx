import React from 'react'
import { Table } from 'react-bootstrap'
import { Vec3 } from 'vec3'

type Props = {
    positions: Array<Vec3>
}

export const CoordsTable: React.FC<Props> = (props) => {
    const { positions } = props

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>#</th>
                    <th>X</th>
                    <th>Y</th>
                    <th>Z</th>
                </tr>
            </thead>
            <tbody>
                {
                    positions?.map((p, index) =>
                        <tr key={index}>
                            <td>{index}</td>
                            <td>{p.x}</td>
                            <td>{p.y}</td>
                            <td>{p.z}</td>
                        </tr>
                    )
                }
            </tbody>
        </Table>
    )
}
