const Worker = require("../core/Worker");
const uuid = require("uuid");
const FORK_ADDRESS = "./examples/types/fork.js";

describe("Test Worker", () => {
  it("should create a worker", () => {
    const worker = new Worker("fork", uuid());
    worker.setAddress(FORK_ADDRESS);
    worker.create();
    expect(worker._worker).toHaveProperty("pid");
  });

  it("should add task", () => {
    const worker = new Worker("fork", uuid());
    const taskMock = {};
    taskMock.getId = jest.fn();
    worker.addTask(taskMock);
    taskMock.getId.mockReturnValueOnce(1);
    expect(taskMock.getId).toBeCalled();
    expect(taskMock.getId).toHaveBeenCalledTimes(1);
    expect(worker._tasks.size).toBe(1);
  });

  it("should remove task from worker", () => {
    const worker = new Worker("fork", uuid());
    const taskMock = {};
    taskMock.setId = jest.fn(id => (taskMock.id = id));
    taskMock.getId = jest.fn(() => taskMock.id);
    worker.addTask(taskMock);
    expect(worker._tasks.size).toBe(1);
    worker.removeTask(taskMock.getId());
    expect(worker._tasks.size).toBe(0);
  });
});
