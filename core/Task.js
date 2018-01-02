class Task {
  constructor(name) {
    this._name = name;
    this._id = null;
    this._task = null;
    this._type = null;
  }

  setMessage(message) {
    this._message = message;
  }
  setType(type) {
    this._type = type;
  }
  getType(type) {
    return this._type;
  }
  setId(id) {
    this._id = id;
  }

  getId() {
    return this._id;
  }

  run(task) {
    this._task = task;
  }

  _execute(...args) {
    return this._task && this.task(...args);
  }
}
Task.TYPE_SPAWN = "spawn";
Task.TYPE_FORK = "fork";
Task.TYPE_EXEC_FILE = "exec_file";
Task.TYPE_EXEC = "exec";
module.exports = Task;
