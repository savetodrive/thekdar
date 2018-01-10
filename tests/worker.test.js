const Worker = require("../core/workers");
const uuid = require("uuid");

describe("Test Worker", () => {
  it("should create a worker", () => {
    const worker = new Worker("fork", uuid());
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
});
