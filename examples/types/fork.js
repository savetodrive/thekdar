const getPort = require("get-port");
const http = require("http");

process.on("message", function(data) {
  console.log(data);
});
console.log("i should be once");
const server = http.createServer((req, res) => {
  process.send({
    type: "random",
    time: Date.now()
  });
  res.end("hello world");
});
getPort().then(port => {
  console.log(`Server listening on port ${port}`);
  server.listen(port);
});
