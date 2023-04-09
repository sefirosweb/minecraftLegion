//@ts-nocheck
import { useState, useEffect } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import useGetSelectedBotSocket from '@/hooks/useGetSelectedBotSocket';
import useGetSocket from '@/hooks/useGetSocket';
import useGetSelectedBot from '@/hooks/useGetSelectedBot';

export const FullConfig = () => {
  const socket = useGetSocket()
  const selectedSocketId = useGetSelectedBotSocket()
  const botConfig = useGetSelectedBot()

  const [jsonText, setJsonText] = useState("")

  useEffect(() => {
    if(botConfig === undefined) return
    const config = { ...botConfig.config }
    delete config.socketId
    setJsonText(JSON.stringify(config, null, 2))
  }, [botConfig, selectedSocketId])

  if (botConfig === undefined) { return null }

  const download = () => {
    const config = { ...botConfig.config }
    delete config.socketId
    const text = JSON.stringify(config, null, 2)

    const filename = `${botConfig.name}`
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  const saveConfig = () => {

    try {
      const fullConfig = JSON.parse(jsonText);
      delete fullConfig.name;
      socket.emit("sendAction", {
        action: 'changeConfig',
        socketId: selectedSocketId,
        value: {
          configToChange: 'saveFullConfig',
          value: fullConfig
        }
      });
    } catch (e) {
      return false;
    }
  }



  return (
    <>
      <Row>
        <Col>
          <Form>
            <h4>List of all events used by bot</h4>
            <Button className='mb-3 me-3' onClick={download}>Download Config</Button>
            <Button className='mb-3' variant='success' onClick={saveConfig}>Save Config</Button>

            <Form.Group className="mb-3" controlId="fullConfigInput">
              <Form.Control
                as="textarea"
                rows={30}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
              />
            </Form.Group>

          </Form>
        </Col>
      </Row>
    </>
  )
}

// const mapStateToProps = (reducers) => {
//   const { configurationReducer } = reducers
//   const { socket, selectedSocketId } = configurationReducer

//   return { socket, selectedSocketId }
// }

// const mapDispatchToProps = {
//   getBotBySocketId
// }

// export default connect(mapStateToProps, mapDispatchToProps)(FullConfig)
