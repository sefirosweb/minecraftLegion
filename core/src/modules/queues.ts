import * as async from 'async'

type Task = {
    name?: string,
    cb: () => void
}

export const webSocketQueue = async.queue((task: Task) => {
    const { cb } = task
    cb();
}, 1);

webSocketQueue.pause();