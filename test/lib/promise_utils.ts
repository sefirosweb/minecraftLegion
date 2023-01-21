import EventEmitter from "events"

type Task = {
  done: boolean,
  promise: Promise<any>,
  cancel: (err: any) => void,
  finish: (result: any) => void
}

type OnEventFunc = (data: any) => void

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const createTask = (): Task => {
  const task: Partial<Task> = {
    done: false
  }

  task.promise = new Promise((resolve, reject) => {
    task.cancel = (err) => {
      if (!task.done) {
        task.done = true
        reject(err)
      }
    }
    task.finish = (result) => {
      if (!task.done) {
        task.done = true
        resolve(result)
      }
    }
  })

  return task as Task
}

export const createDoneTask = () => {
  const task = {
    done: true,
    promise: Promise.resolve(),
    cancel: () => { },
    finish: () => { }
  }
  return task
}

type OnceCondition = {
  timeout?: number,
  checkCondition?: (...args: any[]) => boolean
}

export const onceWithCleanup = (emitter: EventEmitter, event: string, tt: OnceCondition) => {
  const { timeout = 0, checkCondition = undefined } = tt
  const task = createTask()

  const onEvent: OnEventFunc = (...data) => {
    if (typeof checkCondition === 'function' && !checkCondition(...data)) {
      return
    }

    task.finish(data)
  }

  emitter.addListener(event, onEvent)

  if (typeof timeout === 'number' && timeout > 0) {
    // For some reason, the call stack gets lost if we don't create the error outside of the .then call
    const timeoutError = new Error(`Event ${event} did not fire within timeout of ${timeout}ms`)
    sleep(timeout).then(() => {
      if (!task.done) {
        task.cancel(timeoutError)
      }
    })
  }

  task.promise.finally(() => emitter.removeListener(event, onEvent))

  return task.promise
}

export const withTimeout = (promise: Promise<void>, timeout: number) => {
  return Promise.race([
    promise,
    sleep(timeout).then(() => {
      throw new Error('Promise timed out.')
    })
  ])
}