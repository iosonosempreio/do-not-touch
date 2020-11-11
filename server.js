const express = require("express");
const socket = require("socket.io");
const app = express();
app.use(express.static("public"));
app.use('/d3', express.static(__dirname + '/node_modules/d3/dist/'));
const port = process.env.PORT || 3001;
const server = app.listen(port);
console.log("I am up and running!");

let clientsData = [];
const io = socket(server);
io.on("connection", (socket) => {
  clientsData.push({id: socket.id})
  console.log("new  connection: ", socket.id, " - connected clients:", clientsData.length);

  io.to(socket.id).emit('setFrame', index);

  socket.on("interaction", (data) => {
    let thisClient = clientsData.find(d=>d.id===data.id);
    thisClient.data = data.data;
    socket.broadcast.emit("broadcastInteraction", clientsData);
  });

  socket.on("disconnect", () => {
    clientsData = clientsData.filter(d=>d.id!==socket.id)
    console.log("user disconnected", socket.id, " - connected clients:", clientsData.length);
    socket.broadcast.emit("broadcastInteraction", clientsData);
  });
});

const frames = 10;
let index = 0;
let time = 0;
setInterval(()=>{
  io.emit('setFrame', index);
  console.log("current frame", index)
  index++;
  if (index > frames - 1) index=0;
}, 10000)
