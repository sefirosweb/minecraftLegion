import React, { createContext, useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Link, Outlet, useParams } from "react-router-dom";
import { useGetSelectedBot } from '@/hooks/useGetSelectedBot';
import { RenderBotsOnlineList } from '@/components';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Config } from 'base-types';
import { Bot } from '@/types';


export type BotSelectedContextType = {
  bot: Bot,
  botConfig: Config,
  setBotConfig: React.Dispatch<React.SetStateAction<Config | undefined>>
  updateConfig: <K extends keyof Config>(configToChange: K, value: Config[K]) => void
}

export const BotSelectedContext = createContext<BotSelectedContextType>({} as BotSelectedContextType);

export const ConfigurationContextProvider: React.FC = () => {
  const [botConfig, setBotConfig] = useState<Config | undefined>(undefined)

  const { selectedSocketId } = useParams()
  const bot = useGetSelectedBot()

  const { data: botConfigFromServer, isLoading } = useQuery<Config>({
    enabled: selectedSocketId !== undefined,
    queryKey: ['botConfig', selectedSocketId],
    queryFn: () => axios.get<Config>(`/api/get_bot_config/${selectedSocketId}`).then((response) => response.data),
  })

  useEffect(() => {
    if (!botConfigFromServer) return
    setBotConfig(botConfigFromServer)
  }, [botConfigFromServer])

  const updateConfig = <K extends keyof Config>(configToChange: K, value: Config[K]) => {
    if (!botConfig) return
    console.log('updateConfig', configToChange, value)
    const newConfig = structuredClone(botConfig)
    newConfig[configToChange] = value
    setBotConfig(newConfig)
  }

  if (selectedSocketId === undefined || bot === undefined) {
    return (
      <>
        <Row className="my-2">
          <Col md={6} lg={7}>
            <h2>Select the bot</h2>
          </Col>
          <Col md={3}>
            <Link to='/dashboard'>
              <Button className="mb-1">
                Dashboard
              </Button>
            </Link>
          </Col>
        </Row>

        <Row>
          <Col xs={{ span: 12, order: 2 }} md={{ span: 9, order: 1 }} lg={10}>
          </Col>
          <Col xs={{ span: 12, order: 1 }} md={{ span: 3, order: 2 }} lg={2} className='mb-3'>
            <RenderBotsOnlineList />
          </Col>
        </Row>
      </>
    )
  }

  if (isLoading || !botConfig) {
    return (
      <h2>Loading...</h2>
    )
  }

  return (
    <BotSelectedContext.Provider value={{ bot, botConfig, setBotConfig, updateConfig }}>
      <Outlet />
    </BotSelectedContext.Provider>
  )
}
