const uuid = require("uuid");
const Task = require("./Task");
const Worker = require("./workers");

class Thekdar {
  constructor() {
    this.tasks = new Map();
    this.workersTaskMap = new Map();
    this.workers = new Map();
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
    this.tasks.set(taskId, task);
    const taskType = task.getType();
    if (!this.workersTaskMap.get(taskType)) {
      this.workersTaskMap.set(taskType, []);
    }

    this.workersTaskMap.get(taskType).push(taskId);
    return taskId;
  }

  execute(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`No task found with id ${taskId}`);
    }

    this._getFreeWorker();
    task.execute(function done() {
      this.removeTask(taskId);
    });
  }

  _getFreeWorker(task) {
    let worker = this.workers.get(task.getType());
    if (!worker) {
      this.workers.set(task.getType(), new Map());
    }
    worker = this.workers.getType(task.getType());
  }

  _createWorker(type) {
    return new Worker(type).create();
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
