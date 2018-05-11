const uuid = require('uuid');

class Task {
  constructor(name) {
    this._name = name;
    this.id = uuid();
    this.type = null;
    this._workerId = null;
    this.created_at = Date.now();
  }

  setData(message) {
    this.data = message;
  }
  getData() {
    return this.data;
  }
  setType(type) {
    this.type = type;
  }
  getType(type) {
    return this.type;
  }
  setId(id) {
    this.id = id;
  }
  setWorkerId(_workerId) {
    this._workerId = _workerId;
  }
  getId() {
    return this.id;
  }
}
Task.TYPE_SPAWN = 'spawn';
Task.TYPE_FORK = 'fork';
Task.TYPE_EXEC_FILE = 'exec_file';
Task.TYPE_EXEC = 'exec';
module.exports = Task;
