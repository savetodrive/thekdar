const Thekdar = require("./core/Thekdar");
const Task = require("./core/Task");

const project = new Thekdar();

const task = new Task("uploadFile");
task.run(function() {
  console.log("hello world");
});
task.setType(Task.TYPE_FORK);
project.addTask(task);

console.log(project.tasks);
console.log(project._createWorker(Task.TYPE_FORK));
