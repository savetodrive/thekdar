class Task {
  constructor(name) {
    this._name = name;
    this.id = null;
    this.type = null;
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

  getId() {
    return this.id;
  }
}
Task.TYPE_SPAWN = "spawn";
Task.TYPE_FORK = "fork";
Task.TYPE_EXEC_FILE = "exec_file";
Task.TYPE_EXEC = "exec";
module.exports = Task;
