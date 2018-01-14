const getPort = require("get-port");
const http = require("http");

// const server = http.createServer((req, res) => {
process.send({
  type: "random",
  time: Date.now()
});
// res.end("hello world");
// });
// getPort().then(port => {
// console.log(`Server listening on port ${port}`);
// server.listen(port);
// });
