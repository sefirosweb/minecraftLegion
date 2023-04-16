import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import ProgressBar from 'react-bootstrap/ProgressBar'
import { State } from '@/state'
import { useNavigate, useParams } from 'react-router'

const RenderBotsOnlineList = () => {
  const { selectedSocketId } = useParams()

  const botState = useSelector((state: State) => state.botsReducer);
  const { botsOnline } = botState
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate("/dashboard");
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const changeSelectedSocketId = (socketId: string) => {
    const currentPath = location.pathname;
    const newPath = !selectedSocketId ? `${currentPath}/${socketId}` : currentPath.replace(selectedSocketId, socketId);
    navigate(newPath)
  }

  const renderBotList = () => {
    return (
      botsOnline.map((bot) => {
        return (
          <li key={bot.socketId} className={`list-group-item ${(bot.combat) ? 'botlistCombat' : 'botlist'}`}>
            <div className={` ${(bot.combat) ? 'botCombat' : ''}`}>
              <span className={`pointer ${selectedSocketId === bot.socketId ? 'is-selected' : ''}`} onClick={() => changeSelectedSocketId(bot.socketId)}>{bot.name}</span>
              <div>
                <ProgressBar className='mt-1' variant='danger' now={bot.health / 20 * 100} />
                <ProgressBar className='mt-1' variant='warning' now={bot.food / 20 * 100} />
              </div>
            </div>
          </li >
        )
      })

    )
  }

  return (
    <ul className='list-group'>
      <li className='list-group-item active'>Bots Online ({botsOnline.length})</li>
      {renderBotList()}
    </ul>
  )
}

export default RenderBotsOnlineList