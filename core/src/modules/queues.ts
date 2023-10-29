import * as async from 'async'

type Task = {
    name?: string,
    cb: () => Promise<void>
}

export const webSocketQueue = async.queue((task: Task, callback: () => void) => {
    const { cb } = task
    cb()
        .then(callback)
}, 1);


webSocketQueue.pause();