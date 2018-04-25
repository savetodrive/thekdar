const uuid = require('uuid');
const EventEmitter = require('events');
const events = require('./events');
const util = require('util');
const Task = require('./Task');
const Worker = require('./Worker');
const debug = require('debug')('Thekdar:main');

class Thekdar extends EventEmitter {
  constructor() {
    super();
    // All workers
    this._workers = new Map(); // Workers
    // How many workers each worker type have
    this._tasks = new Map(); // how many
    // How many task a worker have
    this._workerTaskLookup = new Map();
    this._workersAddress = new Map();
    this._maxWorkers = 20;
    this._maxTaskPerWorker = 10;
    this._pluggins = [];
  }

  addPluggin(pluggin) {
    this._pluggins.push(pluggin);
    pluggin.apply(this);
  }

  addWorkerAddress(address, workerType) {
    if (!this._workersAddress.has(workerType)) {
      this._workersAddress.set(workerType, []);
    }

    return this._workersAddress.get(workerType).push(address);
  }
  addTask(task, workerAddressIndex = -1) {
    if (!task) {
      throw new Error('Please provide task object instance of Task Class');
    }
    if (!task.getType()) {
      throw new Error('Please provide task type, can be fork, spwan, exec');
    }
    const taskId = uuid();
    task.setId(taskId);
    try {
      const worker = this._getFreeWorker(task, workerAddressIndex);
      if (!worker) {
        debug('No Worker found.');
        return null;
      }
      this._tasks.set(taskId, task);
      task.setWorkerId(worker.getId());
      worker.addTask(this._tasks.get(taskId));
      this._workerTaskLookup.get(worker.getId()).push(task.getId());
      this.emit('add', { worker });
      this.emit('info', { type: 'task:new', task, worker });
      debug(`New task added, previous task count ${this._tasks.size}`);
      return worker;
    } catch (error) {
      debug(error);
      throw error;
    }
  }

  /**
   * Deploy all workers at a time so later we don't
   * have to create worker just before assigining task.
   *
   * @param {*} taskType
   * @param {*} workerAddressIndex
   */
  deployWorkers(taskType = Task.TYPE_FORK, workerAddressIndex) {
    if (this._isWorkersDeployed) {
      return false;
    }
    this._isWorkersDeployed = true;
    let workers = this._workers.get(taskType);
    if (!workers) {
      this._workers.set(taskType, new Map());
    }
    for (let i = 0; i < this._maxWorkers; i++) {
      const worker = this._createWorker(taskType, workerAddressIndex);
      this._workerTaskLookup.set(worker.getId(), []);
    }
    this.emit('info', { type: 'workers:deployed' });
  }
  _getFreeWorker(task, workerTaskLength = 0) {
    if (workerTaskLength === this._maxTaskPerWorker) {
      debug(`All worker are working on with maximum work load.`);
      return false;
    }
    const taskType = task.getType();
    let workers = this._workers.get(taskType);
    let newWorker;

    for (let [workerId, works] of this._workerTaskLookup) {
      if (works.length === workerTaskLength) {
        newWorker = workers.get(workerId);
        break;
      }
    }
    if (!newWorker) {
      newWorker = this._getFreeWorker(task, workerTaskLength + 1);
    }
    return newWorker;
  }

  _createWorker(type, workerAddressIndex = -1) {
    const id = uuid();
    const worker = new Worker(type, id);
    this._workers.get(type).set(id, worker);
    let lWorkerAddressIndex = workerAddressIndex;
    const workerAddress = this._workersAddress.get(worker.getType()) || [];
    if (workerAddressIndex < 0 || workerAddressIndex > workerAddress.length) {
      lWorkerAddressIndex = 0;
    }
    const address = workerAddress[lWorkerAddressIndex];
    if (!address) {
      throw new Error('Please specify address of worker');
    }
    worker.setAddress(address);
    worker.create();
    worker.onChildMessage(this.handleChildMessage(worker));
    worker.onWorkerMessage(this.handleWorkerMessage(worker));
    debug(
      `New Worker created, previous worker count ${this._workerTaskLookup.size}`
    );
    this.emit('info', { type: 'workers:created', worker });
    return worker;
  }

  handleWorkerMessage(worker) {
    return data => {
      this.emit('info', { type: 'workers:message', worker, data });
      switch (data.eventType) {
        case 'stop':
          this._workerTaskLookup.get(data.workerId).forEach(taskId => {
            this.handleTaskComplete({ taskId }, worker);
            this.emit('message', {
              ...data,
              taskId,
              type: events.TASK_ERROR,
              data: {
                message: 'Our worker stopped suddenly, please try again.',
              },
            });
          });
          const newWorker = this._createWorker(worker.getType());
          this._workerTaskLookup.set(newWorker.getId(), []);
          this.removeWorker(data.workerId);
          break;
        case 'exit':
        case 'crash':
          this._workerTaskLookup.get(data.workerId).forEach(taskId => {
            this.handleTaskComplete({ taskId }, worker);
            this.emit('message', {
              ...data,
              taskId,
              type: events.TASK_ERROR,
              data: {
                message: `Sudden ${
                  data.eventType
                } of our worker caused your task to be failed, please try again.`,
              },
            });
          });
          break;
      }
    };
  }
  handleChildMessage(worker) {
    return data => {
      this.emit('info', { type: 'child:message', worker, data });
      switch (data.type) {
        case events.TASK_ERROR:
        case events.TASK_REMOVE:
        case events.TASK_COMPLETE:
          this.handleTaskComplete(data, worker);
          break;
      }
      this.emit('message', data);
    };
  }

  handleTaskComplete(data, worker) {
    this.emit('info', { type: 'task:complete', data, worker });
    return this.removeTask(data.taskId);
  }
  removeTask(taskId) {
    const task = this._tasks.get(taskId);
    if (!task) {
      debug(`No Task found with id ${taskId}`);
      return false;
    }
    try {
      const workersGroup = this._workers.get(task.getType()).keys();
      let workerId = null;
      for (const tempWorkerId of workersGroup) {
        const workerTask = this._workerTaskLookup.get(tempWorkerId);
        const indexOfTask = workerTask.findIndex(id => taskId);
        if (indexOfTask > -1) {
          workerId = tempWorkerId;
          workerTask.splice(indexOfTask, 1);
          break;
        }
      }
      const worker = this._workers.get(task.getType()).get(workerId);
      worker.removeTask(taskId);
      this._tasks.delete(taskId);
      this.emit('info', { type: 'task:deleted', taskId, workerId });
      debug('A task deleted with id of %s', taskId);
      return true;
    } catch (er) {
      debug(er);
      return false;
    }
  }

  getIndexOfTaskInLookup(task) {
    return this._workers
      .get(task.getType())
      .findIndex(taskId => taskId === task.getId());
  }

  removeWorker(workerId) {
    let worker = null;
    for (let workerGroup of this._workers.values()) {
      if (workerGroup.has(workerId)) {
        worker = workerGroup.get(workerId);
        debug('Worker with %s id found, %o', workerId, worker);
        break;
      }
    }
    if (!worker) {
      return false;
    }

    try {
      const tasksIds = this._workerTaskLookup.get(workerId);
      tasksIds.forEach(taskId => {
        this._tasks.delete(taskId);
      });
      this._workers.get(worker.getType()).delete(workerId);
      this._workerTaskLookup.delete(workerId);
      this.emit('info', { type: 'workers:removed', worker });
      debug('Worker with id %s has been deleted', worker.getId());
      return worker.kill();
    } catch (e) {
      debug(e);
      return false;
    }
  }

  getWorkers() {
    return this._workerTaskLookup;
  }

  getTasks() {
    return this._tasks;
  }

  setMaxWorker(maxWorkers) {
    this._maxWorkers = maxWorkers;
  }

  setMaxTaskPerWorker(maxTaskPerWorker) {
    this._maxTaskPerWorker = maxTaskPerWorker;
  }
}
Thekdar.MAX_TASK_PER_WORKER = 10;
Thekdar.MAX_WORKERS = 20;
module.exports = Thekdar;
