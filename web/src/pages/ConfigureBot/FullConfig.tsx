import React, { useState, useEffect, useContext, useRef } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';
import toastr from 'toastr'
import 'jsoneditor/dist/jsoneditor.css';
import { BotSelectedContext } from "./ConfigurationContext";
import { Config } from 'base-types';

export const FullConfig: React.FC = () => {
  const { botConfig, setBotConfig } = useContext(BotSelectedContext);
  const [jsonText, setJsonText] = useState(JSON.stringify(botConfig, null, 4))
  const editorRef = useRef<HTMLDivElement>(null);
  const jsoneditorRef = useRef<JSONEditor | null>(null);

  useEffect(() => {
    setJsonText(JSON.stringify(botConfig, null, 4))
  }, [botConfig]);

  useEffect(() => {
    const options: JSONEditorOptions = {
      onChange: () => {
        if (!jsoneditorRef.current) return
        const newBotConfig = JSON.parse(jsoneditorRef.current.getText()) as Config
        setBotConfig(newBotConfig)
      },
    };

    if (editorRef.current) {
      jsoneditorRef.current = new JSONEditor(editorRef.current, options);
      jsoneditorRef.current.set(JSON.parse(jsonText));
      jsoneditorRef.current.expandAll();
    }

    return () => {
      if (jsoneditorRef.current) {
        jsoneditorRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (jsoneditorRef.current) {
      jsoneditorRef.current.update(JSON.parse(jsonText));
    }
  }, [jsonText]);

  const downloadConfig = () => {
    const filename = `test`
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonText));
    element.setAttribute('download', `${filename}.json`);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const uploadConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return

      if (file.type !== 'text/plain' && file.type !== 'application/json') {
        throw new Error('Invalid file type');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result?.toString();
        if (!text) return

        if (!jsoneditorRef.current) return

        const newBotConfig = JSON.parse(text) as Config

        if (!newBotConfig) {
          throw new Error('Invalid JSON');
        }

        setBotConfig(newBotConfig)
        event.target.value = '';
        toastr.success('Config uploaded successfully')
      };

      reader.readAsText(file);
    } catch (e: any) {
      toastr.error(e.message || 'Error reading file')
    }
  };

  return (
    <>
      <Row>
        <Col>
          <Form>
            <h4>List of all events used by bot</h4>
            <div className='d-flex flex-wrap align-items-end mb-3 gap-3'>

              <div>
                <Button onClick={downloadConfig}>Download Config</Button>
              </div>

              <Form.Group controlId="upload">
                <Form.Label>Upload Config</Form.Label>
                <Form.Control type="file" onChange={uploadConfig} accept=".json,text/plain" />
              </Form.Group>
            </div>

            <div id="jsoneditor" ref={editorRef}></div>
          </Form>
        </Col>
      </Row>
    </>
  )
}
