import { useEffect } from 'react'
import ProgressBar from 'react-bootstrap/ProgressBar'
import { useNavigate, useParams } from 'react-router'
import { ListGroup } from 'react-bootstrap'
import { useStore } from '@/hooks/useStore'

export const RenderBotsOnlineList: React.FC = () => {
  const { selectedSocketId } = useParams()
  const botsOnline = useStore(state => state.botsOnline)

  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // if (event.key === 'Escape') {
        // navigate("/dashboard");
      // }
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


  return (
    <ListGroup>
      <ListGroup.Item variant='primary'>
        Bots Online ({botsOnline.length})
      </ListGroup.Item>

      {botsOnline.map((bot) => (
        <ListGroup.Item
          action
          key={bot.socketId}
          variant={`${selectedSocketId === bot.socketId ? 'info' : ''}`}
          onClick={() => changeSelectedSocketId(bot.socketId)}
        >
          <div className={`${(bot.combat) ? 'text-danger fw-bolder' : ''}`}>
            <div>
              {bot.name}
            </div>
            <div>
              <ProgressBar className='mt-1' variant='danger' now={bot.health / 20 * 100} />
              <ProgressBar className='mt-1' variant='warning' now={bot.food / 20 * 100} />
            </div>
          </div>
        </ListGroup.Item>

      ))}
    </ListGroup>

  )
}
