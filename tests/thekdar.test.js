const Thekdar = require("../core/Thekdar");
const Task = require("../core/Task");
const Worker = require("../core/workers");

describe("Test Thekdar", () => {
  it("should create new thekdar instance", () => {
    const thekdar = new Thekdar();
    expect(thekdar.workers.size).toBe(0);
    expect(thekdar.tasks.size).toBe(0);
    expect(thekdar.workerTaskMap.size).toBe(0);
  });

  it("should add task", () => {
    const thekdar = new Thekdar();
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
  it("should create two workers of fork type", () => {});
  it("should throw error when maximum workers created", () => {});
  it("should only allow limited task per worker", () => {});
  it("should throw error if task not provided or type not provided", () => {
    const thekdar = new Thekdar();
    const task = {};
    task.getType = jest.fn();
    expect(() => thekdar.addTask()).toThrow();
    expect(() => thekdar.addTask(task)).toThrow();
    expect(task.getType).toBeCalled();
  });
  it("should return free worker", () => {
    const thekdar = new Thekdar();
    const task = new Task();
    task.setType(Task.TYPE_FORK);
    task.setMessage({});
    const worker = thekdar._getFreeWorker(task);
    expect(worker).toBeInstanceOf(Worker);
    expect(worker).not.toBe(null);
    expect(worker).toHaveProperty("_id");
  });
});
