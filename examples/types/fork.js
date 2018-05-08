const { events } = require('../../index');

process.on('message', data => {
  // console.log(data);

  switch (data.type) {
    case events.TASK_ADD:
      timer = setTimeout(() => {
        process.send({
          type: 'task:complete',
          taskId: data.task.id,
          workerId: data.workerId,
          data: {},
        });
      }, Math.round(Math.random() * 5000) + 3000);
      break;
    case events.TASK_STOP:
      clearTimeout(timer);
      break;
    default:
      break;
  }
});
