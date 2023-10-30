import green_lamp from '@/images/green_lamp.png'
import red_lamp from '@/images/red_lamp.png'
import { State } from '@/state';
import { useSelector } from 'react-redux';

export const FooterNav: React.FC = () => {
    const botsState = useSelector((state: State) => state.botsReducer);
    const { coreConnected } = botsState

    return (
        <div className="fixed-bottom bg-light">
            <div className="container">
                <div className="d-flex align-items-center">
                    <span className="me-2">Core connected:</span> <img width={'16px'} src={coreConnected ? green_lamp : red_lamp} />
                </div>
            </div>
        </div>
    )
}