import * as async from 'async'

type Task = {
    name?: string,
    cb: () => void
}

export const webSocketQueue = async.queue((task: Task, callback: () => void) => {
    const { cb } = task
    cb();
    callback()
}, 1);

webSocketQueue.pause();