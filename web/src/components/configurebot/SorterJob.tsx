//@ts-nocheck
import { actionCreators, State } from '@/state';
import {  useDispatch, useSelector } from 'react-redux'
import { bindActionCreators } from 'redux';
import ChestArea from './ChestArea'

const SorterJob = () => {

  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { socket, selectedSocketId } = configurationState

  const dispatch = useDispatch();
  const { getBotBySocketId } = bindActionCreators(actionCreators, dispatch);

  const botConfig = getBotBySocketId(selectedSocketId)
  if (botConfig === undefined) { return null }

  const handleInsertNewChestArea = () => {
    socket.emit('sendAction', {
      action: 'changeConfig',
      socketId: botConfig.socketId,
      value: {
        configToChange: 'insertNewChestArea'
      }
    })
  }


  const renderChestArea = () => {
    return botConfig.config.chestAreas.map((chestArea, index) => {
      return (
        <ChestArea key={index} id={index} chestArea={chestArea} />
      )
    })
  }

  return (
    <>
      <div className='row'>
        <div className='col-12'>
          <h4>Insert chest area</h4>
          {renderChestArea()}
        </div>
      </div>

      <div className='row mb-5'>
        <div className='col-12'>
          <button type='button' className='btn btn-success' onClick={handleInsertNewChestArea}>Insert New Chest Area</button>
        </div>
      </div>
    </>
  )
}

export default SorterJob

// const mapStateToProps = (reducers) => {
//   const { configurationReducer } = reducers
//   const { socket, selectedSocketId } = configurationReducer

//   return { socket, selectedSocketId }
// }

// const mapDispatchToProps = {
//   getBotBySocketId
// }

// export default connect(mapStateToProps, mapDispatchToProps)(SorterJob)
