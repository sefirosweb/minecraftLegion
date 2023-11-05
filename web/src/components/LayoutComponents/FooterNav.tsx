import { useStore } from '@/hooks/useStore'
import green_lamp from '@/images/green_lamp.png'
import red_lamp from '@/images/red_lamp.png'

export const FooterNav: React.FC = () => {
    const coreConnected = useStore(state => state.coreConnected)

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