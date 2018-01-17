const uuid = require("uuid");
const EventEmitter = require("events");
const events = require("./events");
const util = require("util");
const Task = require("./Task");
const Worker = require("./Worker");
const debug = require("debug")("Thekdar:main");

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
  }

  addWorkerAddress(address, workerType) {
    if (!this._workersAddress.has(workerType)) {
      this._workersAddress.set(workerType, []);
    }

    return this._workersAddress.get(workerType).push(address);
  }
  addTask(task, workerAddressIndex = -1) {
    if (!task) {
      throw new Error("Please provide task object instance of Task Class");
    }
    if (!task.getType()) {
      throw new Error("Please provide task type, can be fork, spwan, exec");
    }
    const taskId = uuid();
    task.setId(taskId);
    try {
      const worker = this._getFreeWorker(task, workerAddressIndex);
      if (!worker) {
        debug("No Worker found.");
        return null;
      }
      this._tasks.set(taskId, task);
      worker.addTask(this._tasks.get(taskId));
      if (!this._workerTaskLookup.get(worker.getId())) {
        this._workerTaskLookup.set(worker.getId(), []);
      }
      this._workerTaskLookup.get(worker.getId()).push(task.getId());
      this.emit("add", { worker });
      debug(`New task added, previous task count ${this._tasks.size}`);
      return worker;
    } catch (error) {
      debug(error);
      throw error;
    }
  }

  _getFreeWorker(task, workerAddressIndex) {
    if (this._workerTaskLookup.size > Thekdar.MAX_WORKERS) {
      throw new Error(
        `Maximum workers are working ${
          this._workerTaskLookup.size
        }, no further workers can work.`
      );
    }
    const taskType = task.getType();
    let workers = this._workers.get(taskType);
    let newWorker;
    if (!workers) {
      this._workers.set(taskType, new Map());
      newWorker = this._createWorker(taskType, workerAddressIndex);
      return newWorker;
    }
    for (let [index, worker] of this._workers.get(taskType).entries()) {
      let lWorker = this._workerTaskLookup.get(worker.getId());
      if (lWorker.length === Thekdar.MAX_TASK_PER_WORKER - 1) {
        const nextWorker = this._createWorker(taskType, workerAddressIndex);
        this._workerTaskLookup.set(nextWorker.getId(), []);
      }
      if (lWorker.length >= Thekdar.MAX_TASK_PER_WORKER) {
        debug("This worker has maximum task.");
        newWorker = null;
        continue;
      } else {
        newWorker = worker;
        break;
      }
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
      throw new Error("Please specify address of worker");
    }
    worker.setAddress(address);
    worker.create();
    worker.on(this.handleWorkerMessage(worker));
    debug(
      `New Worker created, previous worker count ${this._workerTaskLookup.size}`
    );
    return worker;
  }

  handleWorkerMessage(worker) {
    return data => {
      switch (data.type) {
        case events.TASK_ERROR:
        case events.TASK_REMOVE:
        case events.TASK_COMPLETE:
          this.handleTaskComplete(data, worker);
          break;
      }
      this.emit("message", data);
    };
  }

  handleTaskComplete(data, worker) {
    return this.removeTask(data.taskId);
  }
  removeTask(taskId) {
    const task = this._tasks.get(taskId);
    if (!task) {
      throw new Error(`No Task found with id ${taskId}`);
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
      debug("A task deleted with id of %s", taskId);
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
        debug("Worker with %s id found, %o", workerId, worker);
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
      debug("Worker with id %s has been deleted", worker.getId());
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
}
Thekdar.MAX_TASK_PER_WORKER = 10;
Thekdar.MAX_WORKERS = 20;
module.exports = Thekdar;
