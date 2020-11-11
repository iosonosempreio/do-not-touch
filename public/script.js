const socket = io();
socket.on("connect", () => {
  console.log("socket id", socket.id);
});

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");
});

const story = document.querySelector(".story");
const bbox = story.getBoundingClientRect();
let thisData, storyData = [];

function handleInteraction(x,y) {
  const data = {
    id: socket.id,
    data: {
      x: x - bbox.x,
      y: y - bbox.y,
    },
  };
  thisData = data;
  // console.log("interacted", event);
  socket.emit("interaction", data);
}

story.addEventListener("mousemove", (event)=>{
  handleInteraction(event.x,event.y)
});
story.addEventListener("touchmove", (event)=>{
  event.preventDefault();
  console.log(event)
  const touch = event.touches[0];
  handleInteraction(touch.clientX, touch.clientY)
});

let point = d3.select(".story").selectAll(".point");

socket.on("broadcastInteraction", (data) => {
  // console.log(data);
  storyData = data.filter((d) => d.id !== socket.id);
  // update(points);
});

function update() {
  // console.log('update')
  // console.log("thisData", thisData)
  // console.log("storyData", storyData)
  let data;
  if (thisData) {
    data = storyData.filter(d=>d.id!==thisData.id)
    data.push(thisData)
  } else {
    data = storyData
  }
  // console.log("Data", data)
  point = point.data(data, (d) => d.id);
  point.exit().remove();
  point = point
    .enter()
    .append("div")
    .classed("point", true)
    .merge(point)
    .style("left", (d) => d.data.x)
    .style("top", (d) => d.data.y);
}

const myAnimation = setInterval(update, 30)