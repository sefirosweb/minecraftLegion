//@ts-nocheck
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../css/botlist.css'
import ProgressBar from 'react-bootstrap/ProgressBar'
import { actionCreators, State } from '@/state'
import { bindActionCreators } from 'redux'

const RenderBotsOnlineList = () => {

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { selectedSocketId } = configurationState

  const botState = useSelector((state: State) => state.botsReducer);
  const { botsOnline } = botState

  const dispatch = useDispatch();
  const { setSelectedSocketId } = bindActionCreators(actionCreators, dispatch);


  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        setSelectedSocketId(undefined)
      }
    }
    window.addEventListener('keydown', handleEsc)

    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [setSelectedSocketId])

  const renderBotList = () => {
    return (
      botsOnline.map((bot) => {
        return (
          <li key={bot.socketId} className={`list-group-item ${(bot.combat) ? 'botlistCombat' : 'botlist'}`}>
            <div className={` ${(bot.combat) ? 'botCombat' : ''}`}>
              <span className={`pointer ${selectedSocketId === bot.socketId ? 'is-selected' : ''}`} onClick={() => { setSelectedSocketId(bot.socketId) }}>{bot.name}</span>
              <div>
                <ProgressBar className='mt-1' variant='danger' now={bot.health / 20 * 100} />
                <ProgressBar className='mt-1' variant='warning' now={bot.food / 20 * 100} />
              </div>
            </div>
          </li>
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

// const mapStateToProps = (reducers) => {
//   const { botsReducer, configurationReducer } = reducers
//   const { botsOnline } = botsReducer
//   const { selectedSocketId } = configurationReducer
//   return { botsOnline, selectedSocketId }
// }

// const mapDispatchToProps = {
//   setSelectedSocketId
// }

// export default connect(mapStateToProps, mapDispatchToProps)(RenderBotsOnlineList)
