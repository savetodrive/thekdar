const respawn = require('respawn')
const Task = require('./Task');
const path = require('path');
const { fork } = require('child_process');
const debug = require('debug')('Thekdar:worker');
const events = require('./events');

class Worker {
  constructor(type, id) {
    this._type = type;
    this._tasks = new Map();
    this._id = id;
    this._address = null;
    this.created_at = Date.now();
  }

  getWorker() {
    return this._worker;
  }

  onWorkerMessage(handler) {
    ['stop', 'exit', 'crash'].forEach((eventType) => {
      this._worker.on(eventType, (data) => handler({
        eventType,
        workerId: this.getId(),
        ...data,
      }))
    });
  }
  onChildMessage(handler) {
    this._worker.child.on('message', data => {
      handler({
        workerId: this.getId(),
        ...data,
      });
    });
  }

  create() {
    switch (this._type) {
      case Task.TYPE_FORK:
        this._worker = respawn([this._address], {
          name: this._id,          // set monitor name
          env: process.env, // set env vars
          cwd: '.',              // set cwd
          maxRestarts: 10,        // how many restarts are allowed within 60s
          // or -1 for infinite restarts
          sleep: 1000,            // time to sleep between restarts,
          kill: 30000,            // wait 30s before force killing after stopping
          // stdio: [...],          // forward stdio options
          fork: true             // fork instead of spawn
        });
        this._worker.start();
        debug(`New worker created with id ${this._id}`);
        break;
      default:
        break;
    }
  }

  setAddress(address) {
    this._address = address;
  }

  addTask(task) {
    debug('New task added to worker %s', this._id);
    this.send(events.TASK_ADD, task);
    this._tasks.set(task.getId(), task);
  }

  send(type, data) {
    const payload = {
      type,
      workerId: this.getId(),
      task: data,
    };
    if (this._worker) {
      this._worker.child.send(payload);
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
      this._worker.stop();
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
