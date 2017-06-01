/*
ClientJS
Frank Giddens
December 28, 2016
*/

"use strict";

let socket = io.connect();
let c = document.getElementById("camData");
let c2 = document.getElementById("camData2");
let ctx = c.getContext("2d");
let ctx2 = c2.getContext("2d");
let curDash = "cam";
let datacamData;
let webcamData;
let ready = null;

document.getElementById("curDash").textContent = "Camera";
document.getElementById(curDash + "Select").style.display = "none";
document.getElementById("focDash").style.display = "none";
document.getElementById("telDash").style.display = "none";

let draw = function(){
  if(webcamData != undefined){
    let display1 = new Uint8ClampedArray(webcamData);
    if(display1.length > 0){
      let imgd = new ImageData(display1, 640, 480);
      ctx.canvas.width = 640;
      ctx.canvas.height = 480;
      ctx.putImageData(imgd, 0, 0);
    }
  }
  if(datacamData != undefined){
    let display2 = JSON.parse(JSON.stringify(datacamData.image));
    ctx2.canvas.width = display2.length;
    ctx2.canvas.height = display2[0].length;
    if(document.getElementById("filter").value === "histogram"){
      let histograph = [];
      for(let i = 0; i < 65536; i++){
        histograph.push(0);
      }
      for(let i = 0; i < display2.length; i++){
        for(let j = 0; j < display2[i].length; j++){
          histograph[display2[i][j]]++;
        }
      }
      for(let i = 1; i < histograph.length; i++){
        histograph[i] += histograph[i - 1];
      }
      for(let i = 0; i < histograph.length; i++){
        histograph[i] /= (display2.length * display2[0].length);
        histograph[i] = histograph[i];
      }
      for(let i = 0; i < display2.length; i++){
        for(let j = 0; j < display2[i].length; j++){
          display2[i][j] = Math.floor(255 * histograph[display2[i][j]]);
        }
      }
    }
    if(document.getElementById("filter").value === "linear"){
      for(let i = 0; i < display2.length; i++){
        for(let j = 0; j < display2[i].length; j++){
          display2[i][j] = (display2[i][j] - (display2[i][j] % 256)) / 256;
        }
      }
    }
    for(let i = 0; i < display2.length; i++){
      for(let j = 0; j < display2[i].length; j++){
        ctx2.fillStyle = ("#" + display2[i][j].toString(16) + display2[i][j].toString(16) + display2[i][j].toString(16));
        ctx2.fillRect(i, j, 1, 1);
      }
    }
  }
};

let getMousePos = function(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  let root = document.documentElement;
  let mouseX = evt.clientX - rect.left - root.scrollLeft;
  let mouseY = evt.clientY - rect.top - root.scrollTop;
  return {
    x: mouseX,
    y: mouseY
  };
}

c2.addEventListener("mousemove", function(evt){
  let mousePos = getMousePos(c2, evt);
  mousePos.x = Math.floor(mousePos.x);
  mousePos.y = Math.floor(mousePos.y);
  document.getElementById("mousex").textContent = mousePos.x;
  document.getElementById("mousey").textContent = mousePos.y;
  if(datacamData != undefined){
    document.getElementById("counts").textContent = datacamData.image[mousePos.x][mousePos.y];
  }
});

document.getElementById("filter").addEventListener("change", function(){
  draw();
});

document.getElementById("camSelect").addEventListener("click", function(){
  document.getElementById(curDash + "Select").style.display = "inline";
  document.getElementById(curDash + "Dash").style.display = "none";
  curDash = "cam";
  document.getElementById(curDash + "Select").style.display = "none";
  document.getElementById(curDash + "Dash").style.display = "block";
  document.getElementById("curDash").textContent = "Camera";
});

document.getElementById("focSelect").addEventListener("click", function(){
  document.getElementById(curDash + "Select").style.display = "inline";
  document.getElementById(curDash + "Dash").style.display = "none";
  curDash = "foc";
  document.getElementById(curDash + "Select").style.display = "none";
  document.getElementById(curDash + "Dash").style.display = "block";
  document.getElementById("curDash").textContent = "Focuser";
});

document.getElementById("telSelect").addEventListener("click", function(){
  document.getElementById(curDash + "Select").style.display = "inline";
  document.getElementById(curDash + "Dash").style.display = "none";
  curDash = "tel";
  document.getElementById(curDash + "Select").style.display = "none";
  document.getElementById(curDash + "Dash").style.display = "block";
  document.getElementById("curDash").textContent = "Telescope";
});

document.getElementById("autofocus").addEventListener("click", function(){
  socket.emit("autofocus", {});
});

document.getElementById("expose").addEventListener("click", function(){
  socket.emit("expose", {"objName" : document.getElementById("objName").value, "objNum" : document.getElementById("objNum").value, "expTime" : document.getElementById("expTime").value, "save" : document.getElementById("save").checked});
});

document.getElementById("move").addEventListener("click", function(){
  socket.emit("move", {"direction" : document.getElementById("direction").value, "speed" : document.getElementById("speed").value, "time" : document.getElementById("moveTime").value});
});


document.getElementById("objName").addEventListener("change", function(){
  socket.emit("change", {"element" : "objName", "value" : document.getElementById("objName").value});
});

document.getElementById("objNum").addEventListener("change", function(){
  socket.emit("change", {"element" : "objNum", "value" : document.getElementById("objNum").value});
});

document.getElementById("expTime").addEventListener("change", function(){
  socket.emit("change", {"element" : "expTime", "value" : document.getElementById("expTime").value});
});

document.getElementById("save").addEventListener("change", function(){
  socket.emit("change", {"element" : "save", "value" : document.getElementById("save").checked});
});

document.getElementById("direction").addEventListener("change", function(){
  socket.emit("change", {"element" : "direction", "value" : document.getElementById("direction").value});
});

document.getElementById("speed").addEventListener("change", function(){
  socket.emit("change", {"element" : "speed", "value" : document.getElementById("speed").value});
});

document.getElementById("moveTime").addEventListener("change", function(){
  socket.emit("change", {"element" : "moveTime", "value" : document.getElementById("moveTime").value});
});

socket.on("update", function(data){
  switch(data.change){
    case "all":
      webcamData = data.webcam;
      datacamData = data.datacam;
      ready = Boolean(data.ready);
      document.getElementById("objName").value = data.objName;
      document.getElementById("objNum").value = data.objNum;
      document.getElementById("expTime").value = data.expTime;
      document.getElementById("save").checked = data.save;
      document.getElementById("direction").value = data.direction;
      document.getElementById("speed").value = data.speed;
      document.getElementById("moveTime").value = data.moveTime;
      break;
    case "webcam":
      webcamData = data.webcam;
      break;
    case "datacam":
      datacamData = data.datacam;
      break;
    case "ready":
      ready = Boolean(data.ready);
      break;
    case "objName":
      document.getElementById("objName").value = data.objName;
      break;
    case "objNum":
      document.getElementById("objNum").value = data.objNum;
      break;
    case "expTime":
      document.getElementById("expTime").value = data.expTime;
      break;
    case "save":
      document.getElementById("save").checked = data.save;
      break;
    case "direction":
      document.getElementById("direction").value = data.direction;
      break;
    case "speed":
      document.getElementById("speed").value = data.speed;
      break;
    case "moveTime":
      document.getElementById("moveTime").value = data.moveTime;
      break;
  }
  if(ready != true){
    document.getElementById("autofocus").disabled = true;
    document.getElementById("expose").disabled = true;
    document.getElementById("move").disabled = true;
  }
  else{
    document.getElementById("autofocus").disabled = false;
    document.getElementById("expose").disabled = false;
    document.getElementById("move").disabled = false;
  }
  draw();
});
