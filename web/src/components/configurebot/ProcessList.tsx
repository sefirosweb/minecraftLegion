//@ts-nocheck
import { useSelector } from 'react-redux'
import { bindActionCreators } from "redux";
import { useDispatch } from "react-redux";
import { actionCreators, State } from '@/state';

const FarmerJob = () => {
  const dispatch = useDispatch();
  const { getBotBySocketId } = bindActionCreators(actionCreators, dispatch);
  const configurationState = useSelector((state: State) => state.configurationReducer);
  const { selectedSocketId } = configurationState

  if (selectedSocketId === undefined) { return null }

  const botConfig = getBotBySocketId(selectedSocketId)

  if (botConfig === undefined) { return null }

  const renderEvents = () => {
    return botConfig.events.map((e, i) => {
      return <li key={i}>{e}</li>
    })
  }

  return (
    <>
      <div className='row'>
        <div className='col-12'>
          <h4>List of all events used by bot</h4>
          <div className='border border-warning'>
            <ul>
              {renderEvents()}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default FarmerJob

// const mapStateToProps = (reducers) => {
//   const { configurationReducer } = reducers
//   const { socket, selectedSocketId } = configurationReducer

//   return { socket, selectedSocketId }
// }

// const mapDispatchToProps = {
//   getBotBySocketId
// }

// export default connect(mapStateToProps, mapDispatchToProps)(FarmerJob)
