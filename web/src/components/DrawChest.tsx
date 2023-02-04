
// import { mcAssets } from '../utils/mc';
import smallChest from "../images/smallChest.png";
import largeChest from "../images/largeChest.png";
import Canvas from "./Canvas";
import windowSlotsCoords from '../utils/windowSlotsCoords';
import { Card, Col, Row, Button } from 'react-bootstrap';

type Props = {
    chest: ChestBlock,
    deleteChest: () => void,
    uuid: string
}

const DrawChest = (props: Props) => {
    const { chest, deleteChest, uuid } = props

    const draw = (ctx: CanvasRenderingContext2D) => {
        const chestType = chest.slots.length === 27 ? 'chest' : 'large-chest'
        const base_image = new Image();
        base_image.src = chest.slots.length === 27 ? smallChest : largeChest
        base_image.onload = () => ctx.drawImage(base_image, 0, 0);

        for (const item in chest.slots) {
            if (!chest.slots[item]) continue;

            const inventorySlot = windowSlotsCoords[chestType][chest.slots[item].slot];

            // const itemInfo = chest.slots[item];
            // const texture = mcAssets.textureContent[itemInfo.name].texture;

            const itemImage = new Image();
            itemImage.src = ''; //texture;

            itemImage.onload = function () {
                // Draw item image
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(itemImage, inventorySlot[0], inventorySlot[1], 32, 32);

                // Draw item count
                if (chest.slots[item].count > 1) {
                    ctx.font = "20px monospace";
                    ctx.fillStyle = "black";
                    ctx.textAlign = "end";
                    ctx.fillText(
                        chest.slots[item].count,
                        inventorySlot[0] + 33,
                        inventorySlot[1] + 31
                    );
                    ctx.fillStyle = "white";
                    ctx.fillText(
                        chest.slots[item].count,
                        inventorySlot[0] + 32,
                        inventorySlot[1] + 30
                    );
                }
            };
        }
    }

    const drawChestText = () => {
        return chest.slots.map((i, key) => {
            if (!i) return '';
            return <div key={key}>{i.name} x {i.count}</div>
        })
    }

    return (
        <div>
            <Card className='m-3'>
                <Card.Body>
                    <Card.Title>Chests {uuid}</Card.Title>
                    <Card.Text>
                        <Row>
                            <Col xs={6}>
                                <span>
                                    Dimension: {chest.position.dimension}
                                </span>
                            </Col>
                            <Col xs={2}>
                                <span className='badge bg-primary text-white'>
                                    X: {chest.position.x}
                                </span>
                            </Col>
                            <Col xs={2}>
                                <span className='badge bg-warning text-dark'>
                                    Y: {chest.position.y}
                                </span>
                            </Col>
                            <Col xs={2}>
                                <span className='badge bg-secondary text-white'>
                                    Z: {chest.position.z}
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col className='mt-2'>
                                <Button
                                    variant='danger'
                                    onClick={deleteChest}
                                >
                                    Delete Chest
                                </Button>
                            </Col>
                        </Row>
                    </Card.Text>
                    <Card.Text>
                        {drawChestText()}
                    </Card.Text>
                    <Canvas
                        draw={draw}
                        width={352}
                        height={chest.slots.length === 27 ? 150 : 260}
                    />
                </Card.Body>
            </Card>
        </div>

    )
}

export default DrawChest