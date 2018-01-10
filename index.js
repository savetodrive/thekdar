const Thekdar = require("./core/Thekdar");
const Task = require("./core/Task");

const thekdar = new Thekdar();
for (let i = 0; i < Thekdar.MAX_TASK_PER_WORKER; i++) {
  const task = {};
  task.getType = () => Task.TYPE_FORK;
  task.setId = id => (task.id = id);
  task.getId = () => task.id;
  thekdar.addTask(task);
}
for (let i = 0; i < Thekdar.MAX_TASK_PER_WORKER; i++) {
  const task = {};
  task.getType = () => Task.TYPE_FORK;
  task.setId = id => (task.id = id);
  task.getId = () => task.id;
  thekdar.addTask(task);
}

thekdar.on("add", console.log);
