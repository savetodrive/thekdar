const Thekdar = require("./core/Thekdar");
const Task = require("./core/Task");

const project = new Thekdar();

const task = new Task("uploadFile");
task.run(function() {
  console.log("hello world");
});
task.setType(Task.TYPE_FORK);
task.setMessage({
  type: "upload",
  url: "hello world"
});
const task1 = new Task("uploadFile");
task1.run(function() {
  console.log("hello world");
});
task1.setType(Task.TYPE_FORK);
task1.setMessage({
  type: "upload",
  url: "hello world"
});
project.addTask(task);
project.addTask(task1);
console.log(project);
