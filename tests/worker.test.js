const childProcess = require("child_process");
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
    worker.addTask({
      getId() {
        return uuid();
      }
    });
    expect(worker._tasks.size).toBe(1);
  });
  // it("should add a task", () => {});
});
