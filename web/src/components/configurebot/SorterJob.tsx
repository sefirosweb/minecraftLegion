//@ts-nocheck
import ChestArea from './ChestArea'
import useGetSocket from '@/hooks/useGetSocket';
import useGetSelectedBot from '@/hooks/useGetSelectedBot';

export const SorterJob = () => {
  const socket = useGetSocket()
  const botConfig = useGetSelectedBot()

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

// const mapStateToProps = (reducers) => {
//   const { configurationReducer } = reducers
//   const { socket, selectedSocketId } = configurationReducer

//   return { socket, selectedSocketId }
// }

// const mapDispatchToProps = {
//   getBotBySocketId
// }

// export default connect(mapStateToProps, mapDispatchToProps)(SorterJob)
