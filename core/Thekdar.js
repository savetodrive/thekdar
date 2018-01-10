const uuid = require("uuid");
const Task = require("./Task");
const Worker = require("./workers");
const EventEmitter = require("events").EventEmitter;

class Thekdar extends EventEmitter {
  constructor() {
    super();
    this.workers = new Map(); // Workers
    this.tasks = new Map(); // Number of tasks
    this.workerTaskMap = new Map();
  }

  addTask(task) {
    if (!task) {
      throw new Error("Please provide task object instance of Task Class");
    }
    if (!task.getType()) {
      throw new Error("Please provide task type, can be fork, spwan, exec");
    }
    const taskId = uuid();
    task.setId(taskId);
    const worker = this._getFreeWorker(task);
    if (!worker) {
      return null;
    }
    this.tasks.set(taskId, task);
    worker.addTask(this.tasks.get(taskId));
    if (!this.workerTaskMap.get(worker.getId())) {
      this.workerTaskMap.set(worker.getId(), []);
    }
    this.workerTaskMap.get(worker.getId()).push(task.getId());
    this.emit("add", { worker });
    return worker;
  }

  _getFreeWorker(task) {
    if (this.workerTaskMap.size > Thekdar.MAX_WORKERS) {
      return null;
    }
    const taskType = task.getType();
    let workers = this.workers.get(taskType);
    let newWorker;
    if (!workers) {
      this.workers.set(taskType, new Map());
      newWorker = this._createWorker(taskType);
      return newWorker;
    }
    for (let [index, worker] of this.workers.get(taskType).entries()) {
      let lWorker = this.workerTaskMap.get(worker.getId());
      if (lWorker.length === Thekdar.MAX_TASK_PER_WORKER - 1) {
        const nextWorker = this._createWorker(taskType);
        this.workerTaskMap.set(nextWorker.getId(), []);
      }
      if (lWorker.length >= Thekdar.MAX_TASK_PER_WORKER) {
        newWorker = null;
        continue;
      } else {
        newWorker = worker;
        break;
      }
    }
    return newWorker;
  }

  _createWorker(type) {
    const id = uuid();
    const worker = new Worker(type, id);
    this.workers.get(type).set(id, worker);
    worker.create();
    return worker;
  }
  removeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`No Task found with id ${taskId}`);
    }

    this.workersTaskMap
      .get(task.getType())
      .splice(this.getIndexOfTask(task), 1);
    this.tasks.delete(taskId);
  }

  getIndexOfTask(task) {
    return this.workers
      .get(task.getType())
      .findIndex(taskId => taskId === task.getId());
  }
}
Thekdar.MAX_TASK_PER_WORKER = 10;
Thekdar.MAX_WORKERS = 20;
module.exports = Thekdar;
