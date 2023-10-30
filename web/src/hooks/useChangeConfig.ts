import { useSendActionSocket } from "./useSendActionSocket";

export const useChangeConfig = () => {
    const sendAction = useSendActionSocket()

    return (configToChange: string, value?: any) => {
        sendAction('changeConfig', {
            configToChange,
            value
        })
    }
}