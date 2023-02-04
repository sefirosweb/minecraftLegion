//@ts-nocheck
import { useState, useEffect } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useDispatch } from "react-redux";
import { actionCreators, State } from "@/state";
import { useSelector } from "react-redux";
import { bindActionCreators } from "redux";

const FullConfig = () => {
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, selectedSocketId } = configurationState

  const dispatch = useDispatch();
  const { getBotBySocketId } = bindActionCreators(actionCreators, dispatch);

  const [jsonText, setJsonText] = useState("")

  useEffect(() => {
    const botConfig = getBotBySocketId(selectedSocketId)
    const config = { ...botConfig.config }
    delete config.socketId
    setJsonText(JSON.stringify(config, null, 2))
  }, [getBotBySocketId, selectedSocketId])

  const botConfig = getBotBySocketId(selectedSocketId)
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

export default FullConfig

// const mapStateToProps = (reducers) => {
//   const { configurationReducer } = reducers
//   const { socket, selectedSocketId } = configurationReducer

//   return { socket, selectedSocketId }
// }

// const mapDispatchToProps = {
//   getBotBySocketId
// }

// export default connect(mapStateToProps, mapDispatchToProps)(FullConfig)
