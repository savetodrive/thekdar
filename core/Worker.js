const Task = require("./Task");
const path = require("path");
const { fork } = require("child_process");
const debug = require("debug")("Thekdar:worker");
const events = require("./events");

class Worker {
  constructor(type, id) {
    this._type = type;
    this._tasks = new Map();
    this._id = id;
    this._address = null;
  }

  on(handler) {
    this._worker.on("message", data => {
      handler({
        workerId: this.getId(),
        ...data
      });
    });
  }

  create() {
    switch (this._type) {
      case Task.TYPE_FORK:
        debug(`New worker created with id ${this._id}`);
        this._worker = fork(this._address);
        break;
      default:
        break;
    }
  }

  setAddress(address) {
    this._address = address;
  }

  addTask(task) {
    debug("New task added to worker %s", this._id);
    this.send(events.TASK_ADD, task);
    this._tasks.set(task.getId(), task);
  }

  send(type, data) {
    const payload = {
      type,
      workerId: this.getId(),
      task: data
    };
    if (this._worker) {
      this._worker.send(payload);
    }
  }
  getId() {
    return this._id;
  }

  getType() {
    return this._type;
  }

  kill() {
    try {
      this._tasks.clear();
      this._worker.kill();
      return true;
    } catch (e) {
      debug(e);
      return false;
    }
  }
  removeTask(taskId) {
    return this._tasks.delete(taskId);
  }
}

module.exports = Worker;
