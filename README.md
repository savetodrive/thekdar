# Thekdar [![Build Status](https://travis-ci.org/savetodrive/thekdar.svg?branch=master)](https://travis-ci.org/savetodrive/thekdar)

Thekdar is module which will manage node child process , it will help us creating workers, distribute task across workers, kill workers or limit there work

# Example

```
const Thekdar = require("thekdar");
const events = Thekdar.events;
const Task = Thekdar.Tasks;

// Create new thekdar object
const thekdar = new Thekdar();

// Path of script to be executed and type of worker
    thekdar.addWorkerAddress(
      "./core/workers/fork.js",
       Task.TYPE_FORK
    );


  handleJobs(data, done) {
    // Create new task from Task class
    const task = new  Task();

    task.setData(data);

    // Set type of task like (fork, spawn)
    task.setType(Task.TYPE_FORK);

    try {
      // add task to thekdar
      const add = thekdar.addTask(task);

    } catch (error) {
      logger.error(error);
      logger.error(`Unable to completed job,
      Workers ${thekdar.getWorkers().size},
      tasks ${thekdar.getTasks().size}`);
      return done(error);
    }
  }

  _handleThekdarMessages() {
     thekdar.on("message", data => {
      switch (data.type) {
        case events.TASK_ERROR:
          break;
        case events.TASK_COMPLETE:
        case events.TASK_REMOVE:
          console.log(thekdar.getWorkers().size);
          console.log(thekdar.getTasks().size);
           break;
      }
    });
  }
```
