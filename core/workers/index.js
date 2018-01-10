const Fork = require("./types/Fork");
const Task = require("../Task");
const path = require("path");
const { fork } = require("child_process");
const debug = require("debug")("Thekdar:worker");

class Worker {
  constructor(type, id) {
    this._type = type;
    this._tasks = new Map();
    this._id = id;
  }

  create() {
    switch (this._type) {
      case Task.TYPE_FORK:
        debug(`New worker created with id ${this._id}`);
        this._worker = fork(path.resolve(__dirname, "./types/Fork.js"));
        break;
      default:
        break;
    }
  }

  addTask(task) {
    debug("New task added to worker %s", this._id);
    this._tasks.set(task.getId(), task);
  }

  getId() {
    return this._id;
  }
}

module.exports = Worker;
