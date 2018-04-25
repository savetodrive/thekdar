const Thekdar = require("../core/Thekdar");
const Task = require("../core/Task");
const Worker = require("../core/Worker");

const FORK_ADDRESS = "./examples/types/fork.js";
describe("Test Thekdar", () => {
  it("should create new thekdar instance", () => {
    const thekdar = new Thekdar();
    thekdar.addWorkerAddress(FORK_ADDRESS, Task.TYPE_FORK);
    expect(thekdar._workers.size).toBe(0);
    expect(thekdar._tasks.size).toBe(0);
    expect(thekdar._workerTaskLookup.size).toBe(0);
  });

  it("should add task", () => {
    const thekdar = new Thekdar();
    thekdar.addWorkerAddress(FORK_ADDRESS, Task.TYPE_FORK);
    const task = {};
    task.getType = jest.fn(() => Task.TYPE_FORK);
    task.setId = jest.fn(id => (task.id = id));
    task.getId = jest.fn(() => task.id);
    const worker = thekdar.addTask(task);
    expect(worker).toBeInstanceOf(Worker);
    expect(worker).not.toBe(null);
    expect(worker).toHaveProperty("_id");
    expect(task.getType).toHaveBeenCalledTimes(2);
    expect(task.setId).toHaveBeenCalledTimes(1);
    expect(task.getId).toHaveBeenCalledTimes(2);
  });

  it("should remove worker", () => {
    const thekdar = new Thekdar();
    thekdar.addWorkerAddress(FORK_ADDRESS, Task.TYPE_FORK);
    const tasks = [];
    const workers = [];
    for (let i = 0; i < 15; i++) {
      const task = {};
      task.getType = jest.fn(() => Task.TYPE_FORK);
      task.setId = jest.fn(id => (task.id = id));
      task.getId = jest.fn(() => task.id);
      tasks.push(task);
      workers.push(thekdar.addTask(task));
    }

    expect(thekdar._workers.get(tasks[0].getType()).size).toBe(2);
    expect(thekdar._workerTaskLookup.size).toBe(2);
    const worker = workers[0];
    expect(thekdar.removeWorker(worker.getId())).toBe(true);
    expect(thekdar._workers.get(tasks[0].getType()).size).toBe(1);
    expect(thekdar._workerTaskLookup.size).toBe(1);
    expect(thekdar._tasks.size).toBe(5);
  });
  it("should remove task", () => {
    const thekdar = new Thekdar();
    thekdar.addWorkerAddress(FORK_ADDRESS, Task.TYPE_FORK);
    const tasks = [];
    const workers = [];
    for (let i = 0; i < 15; i++) {
      const task = {};
      task.getType = jest.fn(() => Task.TYPE_FORK);
      task.setId = jest.fn(id => (task.id = id));
      task.getId = jest.fn(() => task.id);
      tasks.push(task);
      workers.push(thekdar.addTask(task));
    }
    expect(thekdar._workerTaskLookup.size).toBe(2);
    expect(thekdar._tasks.size).toBe(15);
    expect(thekdar.removeTask(tasks[0].getId())).toBe(true);
    expect(thekdar._tasks.size).toBe(14);
  });
});
