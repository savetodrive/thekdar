const Fork = require("./types/Fork");
const Task = require("../Task");
const path = require("path");
const { fork } = require("child_process");

class Worker {
  constructor(type) {
    this._type = type;
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
}

module.exports = Worker;
