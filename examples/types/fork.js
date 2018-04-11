process.on('message', data => {
  // console.log(data);

  setTimeout(() => {
    process.send({
      type: 'task:complete',
      taskId: data.task.id,
      workerId: data.workerId,
      data: {},
    });
  }, Math.round(Math.random() * 5000) + 3000);
});
