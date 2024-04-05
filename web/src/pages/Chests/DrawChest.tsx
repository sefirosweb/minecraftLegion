import smallChest from "@/images/smallChest.png";
import largeChest from "@/images/largeChest.png";
import { Canvas } from "./Canvas";
import { windowSlotsCoords } from '@/utils/windowSlotsCoords';
import { Card, Col, Row, Button } from 'react-bootstrap';
import { ChestBlock } from "base-types";

type Props = {
    chest: ChestBlock,
    deleteChest: () => void,
    uuid: string
}

export const DrawChest: React.FC<Props> = (props) => {
    const { chest, deleteChest, uuid } = props

    const draw = (ctx: CanvasRenderingContext2D) => {
        const chestType = chest.slots.length === 27 ? 'chest' : 'large-chest'
        const base_image = new Image();
        base_image.src = chest.slots.length === 27 ? smallChest : largeChest
        base_image.onload = () => ctx.drawImage(base_image, 0, 0);

        for (const slot in chest.slots) {
            if (!chest.slots[slot]) continue;
            const windowSlots = windowSlotsCoords[chestType]
            const inventorySlot = windowSlots[slot];
            const itemInfo = chest.slots[slot];

            const itemImage = new Image();
            itemImage.src = `/minecraft-assets/${itemInfo.name}`

            itemImage.onload = function () {
                // Draw item image
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(itemImage, inventorySlot[0], inventorySlot[1], 32, 32);
                // Draw item count
                if (chest.slots[slot].count > 1) {
                    ctx.font = "20px monospace";
                    ctx.fillStyle = "black";
                    ctx.textAlign = "end";
                    ctx.fillText(
                        itemInfo.count.toString(),
                        inventorySlot[0] + 33,
                        inventorySlot[1] + 31
                    );
                    ctx.fillStyle = "white";
                    ctx.fillText(
                        itemInfo.count.toString(),
                        inventorySlot[0] + 32,
                        inventorySlot[1] + 30
                    );
                }
            };
        }
    }

    const groupedItems = [];
    for (const slot in chest.slots) {
        if (!chest.slots[slot]) continue;
        const itemInfo = chest.slots[slot];
        const index = groupedItems.findIndex((item) => item.name === itemInfo.name);
        if (index === -1) {
            groupedItems.push({
                name: itemInfo.name,
                count: itemInfo.count
            })
        } else {
            groupedItems[index].count += itemInfo.count
        }
    }

    groupedItems.sort((a, b) => a.name.localeCompare(b.name))

    return (
        <div>
            <Card className='m-3'>
                <Card.Body>
                    <Card.Title>Chests {uuid}</Card.Title>

                    <Row className="mb-3">
                        <Col xs={6}>
                            <span>
                                Dimension: {chest.dimension}
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
                        <Col className='mb-3'>
                            <Button
                                variant='danger'
                                onClick={deleteChest}
                            >
                                Delete Chest
                            </Button>
                        </Col>
                    </Row>

                    <div className="mb-2">
                        {groupedItems.map((item, index) => (
                            <Row key={index}>
                                <Col>
                                    <span>
                                        {item.name}
                                    </span>
                                </Col>
                                <Col >
                                    <span>
                                        {item.count}
                                    </span>
                                </Col>
                            </Row>
                        ))}
                    </div>
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
