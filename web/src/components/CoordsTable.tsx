import { Table } from 'react-bootstrap'

type Props = {
    positions: Array<Coords>
}

const CoordsTable = (props: Props) => {
    const { positions } = props

    console.log({positions})

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
                    positions.map((p, index) =>
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

export default CoordsTable
