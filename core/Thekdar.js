const uuid = require("uuid");
const Task = require("./Task");
const Worker = require("./workers");

class Thekdar {
  constructor() {
    this.workers = new Map();
    this.tasks = new Map();
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
    return worker;
  }

  _getFreeWorker(task) {
    const taskType = task.getType();
    let workers = this.workers.get(taskType);
    let worker;
    if (!workers) {
      this.workers.set(taskType, new Map());
      worker = this._createWorker(taskType);
      return worker;
    }
    for (let workerTemp of this.workers.get(taskType).entries()) {
      let lWorker = this.workerTaskMap.get(workerTemp[1].getId());
      if (lWorker.length > Thekdar.MAX_TASK_PER_WORKER) {
        if (this.workersTaskMap.size > Thekdar.MAX_WORKER) {
          console.warn("Max worker exceeded");
          worker = null;
          break;
        } else {
          worker = this._createWorker(taskType);
          break;
        }
      } else {
        worker = workerTemp[1];
        break;
      }
    }
    return worker;
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
Thekdar.MAX_WORKER = 20;
module.exports = Thekdar;
