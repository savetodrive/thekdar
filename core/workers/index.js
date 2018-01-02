const Fork = require("./types/Fork");
const Task = require("../Task");
const path = require("path");
const { fork } = require("child_process");

class Worker {
  constructor(type, id) {
    this._type = type;
    this._tasks = new Map();
    this._id = id;
  }

  create() {
    switch (this._type) {
      case Task.TYPE_FORK:
        this._worker = fork(path.resolve(__dirname, "./types/Fork.js"));
        break;
      default:
        break;
    }
  }

  addTask(task) {
    this._tasks.set(task.getId(), task);
  }

  getId() {
    return this._id;
  }
}

module.exports = Worker;
