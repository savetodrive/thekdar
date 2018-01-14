const Thekdar = require("../core/Thekdar");
const Task = require("../core/Task");
const Worker = require("../core/Worker");

const FORK_ADDRESS = "./examples/types/fork.js";
describe("Test Thekdar", () => {
  it("should create new thekdar instance", () => {
    const thekdar = new Thekdar();
    thekdar.addWorkerAdress(FORK_ADDRESS, Task.TYPE_FORK);
    expect(thekdar._workers.size).toBe(0);
    expect(thekdar._tasks.size).toBe(0);
    expect(thekdar._workerTaskLookup.size).toBe(0);
  });

  it("should add task", () => {
    const thekdar = new Thekdar();
    thekdar.addWorkerAdress(FORK_ADDRESS, Task.TYPE_FORK);
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
  it("should create three workers of fork type", () => {
    const thekdar = new Thekdar();
    thekdar.addWorkerAdress(FORK_ADDRESS, Task.TYPE_FORK);
    const workers = [];
    for (let i = 0; i < 20; i++) {
      const task = {};
      task.getType = jest.fn(() => Task.TYPE_FORK);
      task.setId = jest.fn(id => (task.id = id));
      task.getId = jest.fn(() => task.id);
      let worker = thekdar.addTask(task);
      if (!workers.includes(worker.getId())) {
        workers.push(worker.getId());
      }
      // Till 8 tasks in worker we will have 1 worker
      if (i === 8) {
        expect(thekdar._workers.get(Task.TYPE_FORK).size).toBe(1);
      }
      // After 9 tasks new worker will be created and workers will be 2
      if (i === Thekdar.MAX_TASK_PER_WORKER - 1) {
        expect(thekdar._workers.get(Task.TYPE_FORK).size).toBe(2);
        expect(thekdar._workerTaskLookup.get(worker.getId()).length).toBe(
          Thekdar.MAX_TASK_PER_WORKER
        );
      }
      if (i === 19) {
        expect(thekdar._workers.get(Task.TYPE_FORK).size).toBe(3);
        expect(thekdar._workerTaskLookup.get(worker.getId()).length).toBe(
          Thekdar.MAX_TASK_PER_WORKER
        );
      }
    }
    expect(thekdar._workers.get(Task.TYPE_FORK).size).toBe(3);
  });
  it("should only allow limited task per worker", () => {
    const thekdar = new Thekdar();
    thekdar.addWorkerAdress(FORK_ADDRESS, Task.TYPE_FORK);
    for (let i = 0; i < 15; i++) {
      const task = {};
      task.getType = jest.fn(() => Task.TYPE_FORK);
      task.setId = jest.fn(id => (task.id = id));
      task.getId = jest.fn(() => task.id);
      thekdar.addTask(task);
    }
    thekdar._workerTaskLookup.forEach(tasks => {
      expect(tasks.length <= 10).toBe(true);
    });
  });
  it("should throw error if task not provided or type not provided", () => {
    const thekdar = new Thekdar();
    thekdar.addWorkerAdress(FORK_ADDRESS, Task.TYPE_FORK);
    const task = {};
    task.getType = jest.fn();
    expect(() => thekdar.addTask()).toThrow();
    expect(() => thekdar.addTask(task)).toThrow();
    expect(task.getType).toBeCalled();
  });
  it("should return free worker", () => {
    const thekdar = new Thekdar();
    thekdar.addWorkerAdress(FORK_ADDRESS, Task.TYPE_FORK);
    const task = new Task();
    task.setType(Task.TYPE_FORK);
    task.setData({});
    const worker = thekdar._getFreeWorker(task);
    expect(worker).toBeInstanceOf(Worker);
    expect(worker).not.toBe(null);
    expect(worker).toHaveProperty("_id");
  });
  it("should throw error when maximum workers created", () => {});
  it("should remove worker", () => {});
  it("should remove task", () => {
    const thekdar = new Thekdar();
    thekdar.addWorkerAdress(FORK_ADDRESS, Task.TYPE_FORK);
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
