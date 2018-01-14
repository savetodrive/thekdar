const Thekdar = require("./core/Thekdar");
const Task = require("./core/Task");

const thekdar = new Thekdar();
thekdar.addWorkerAdress("./examples/types/fork.js", Task.TYPE_FORK);
// thekdar.on("add", d => {
// console.log(d);
// });

thekdar.on("message", data => {
  // console.log(data);
});
for (let i = 0; i < 4; i++) {
  const task = new Task();
  task.setType(Task.TYPE_FORK);
  task.setId = id => (task.id = id);
  task.getId = () => task.id;
  task.setData({
    accessToken: "toje",
    data: {
      url: "ee"
    }
  });
  thekdar.addTask(task);
}

// thekdar.removeWorker(worker.getId());
// for (let i = 0; i < Thekdar.MAX_TASK_PER_WORKER; i++) {
//   const task = {};
//   task.getType = () => Task.TYPE_FORK;
//   task.setId = id => (task.id = id);
//   task.getId = () => task.id;
//   thekdar.addTask(task);
// }
exports = Thekdar;
exports = Task;
