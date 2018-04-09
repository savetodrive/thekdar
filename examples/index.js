const Thekdar = require('../index');

const Task = Thekdar.Task;
const thekdar = new Thekdar();
thekdar.addWorkerAddress('./examples/types/fork.js', Task.TYPE_FORK);
thekdar.deployWorkers();
const task = new Task();
task.setData({
  message: 'hello world',
});
task.setType(Task.TYPE_FORK);
thekdar.addTask(task);
