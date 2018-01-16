const Thekdar = require("./core/Thekdar");
const Task = require("./core/Task");
const events = require("./core/events");

Thekdar.Task = Task;
Thekdar.events = events;
module.exports = Thekdar;
