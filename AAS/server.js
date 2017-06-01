/*
ServerJS
Frank Giddens
December 28, 2016
*/

"use strict";

let fs = require("fs");
let url = require("url");
let http = require("http");
let child = require("child_process");
let io = require("socket.io");
let getPixels = require("get-pixels");

let server;
let listener;
let port = 8080;

let webcam;
let datacam;
let ready = true;
let objName = "";
let objNum = "";
let expTime = "";
let save = false;
let direction = "up";
let speed = "1";
let moveTime = "";
let temperature = [];
let humidity = [];
let altitude = [];
let azimuth = [];

let getIPAddress = function(){
  let address = "127.0.0.1";
  let interfaces = require("os").networkInterfaces();
  for(let devName in interfaces){
    let iface = interfaces[devName];
    for(let i = 0; i < iface.length; i++){
      let alias = iface[i];
      if(alias.family === 'IPv4' && alias.address !== "127.0.0.1" && !alias.internal){
        address = alias.address;
      }
    }
  }
  return address;
};

let handleRequest = function(req, res){
  let pathname = url.parse(req.url).pathname;
  if(pathname.indexOf(".") === -1){
    pathname += ".html";
  }
  if(pathname.indexOf("/") === 0){
    pathname = pathname.substr(1);
  }
  if(pathname === ".html"){
    pathname = "index.html";
  }
  fs.readFile(pathname, function(err, data){
    if(err){
      res.writeHead(404, {'Content-Type': 'text/html'});
    }
    else{
      switch(pathname.substr(pathname.lastIndexOf(".") + 1)){
        case "css":
          res.writeHead(200, {'Content-Type': 'text/css'});
          res.write(data.toString());
          break;
        case "html":
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(data.toString());
          break;
        case "js":
          res.writeHead(200, {'Content-Type': 'text/js'});
          res.write(data.toString());
          break;
      }
    }
    res.end();
    });
};

let init = function(){
  server = http.createServer(handleRequest);
  server.listen(port, getIPAddress());
  listener = io.listen(server);
  listener.sockets.on("connection", function(socket){
    socket.emit("update", {"webcam" : webcam, "datacam" : datacam, "ready" : ready, "objName" : objName, "objNum" : objNum, "expTime" : expTime, "save" : save, "direction" : direction, "speed" : speed, "moveTime" : moveTime, "change" : "all"});
    setInterval(function(){
      socket.emit("update", {"webcam" : webcam, "change" : "webcam"});
    }, 1000);
    socket.on("change", function(data){
      let changed = false;
      switch(data.element){
        case "objName":
          objName != data.value ? changed = true : changed = false;
          objName = data.value;
          break;
        case "objNum":
          objNum != data.value ? changed = true : changed = false;
          objNum = data.value;
          break;
        case "expTime":
          expTime != data.value ? changed = true : changed = false;
          expTime = data.value;
          break;
        case "save":
          save != data.value ? changed = true : changed = false;
          save = data.value;
          break;
        case "direction":
          direction != data.value ? changed = true : changed = false;
          direction = data.value;
          break;
        case "speed":
          speed != data.value ? changed = true : changed = false;
          speed = data.value;
          break;
        case "moveTime":
          moveTime != data.value ? changed = true : changed = false;
          moveTime = data.value;
          break;
      }
      if(changed){
        let ele = data.element;
        let val = data.value;
        socket.broadcast.emit("update", {ele : val, "change" : data.element});
      }
    });
    socket.on("autofocus", function(){
      ready = false;
      socket.emit("update", {"ready" : ready, "change" : "ready"});
      socket.broadcast.emit("update", {"ready" : ready, "change": "ready"});
      child.exec("python focuser.py", function(){
        ready = true;
        socket.emit("update", {"ready" : ready, "change" : "ready"});
        socket.broadcast.emit("update", {"ready" : ready, "change" : "ready"});
      });
    });
    socket.on("expose", function(){
      ready = false;
      socket.emit("update", {"ready" : ready, "change" : "ready"});
      socket.broadcast.emit("update", {"ready" : ready, "change" : "ready"});
      child.exec("python camera.py " + objName + objNum + " " + expTime + " " + save, function(){
        fs.readFile("new.json", function(err, data){
          if(!err){
            datacam = JSON.parse(data);
          }
          ready = true;
          objNum = (parseInt(objNum) + 1).toString();
          socket.emit("update", {"datacam" : datacam, "change" : "datacam"});
          socket.emit("update", {"objNum" : objNum, "change" : "objNum"});
          socket.emit("update", {"ready" : ready, "change" : "ready"});
          socket.broadcast.emit("update", {"datacam" : datacam, "change" : "datacam"});
          socket.broadcast.emit("update", {"objNum" : objNum, "change" : "objNum"});
          socket.broadcast.emit("update", {"ready" : ready, "change" : "ready"});
        });
      });
    });
    socket.on("move", function(){
      let dir;
      let axis;
      switch(direction){
        case "up":
          axis = 1;
          dir = 1;
          break;
        case "down":
          axis = 1;
          dir = 0;
          break;
        case "left":
          axis = 0;
          dir = 0;
          break;
        case "right":
          axis = 0;
          dir = 1;
          break;
      }
      ready = false;
      socket.emit("update", {"ready" : ready, "change" : "ready"});
      socket.broadcast.emit("update", {"ready" : ready, "change" : "ready"});
      child.exec("python telescope.py " + axis + " " + dir + " " + speed + " " + moveTime, function(){
        ready = true;
        socket.emit("update", {"ready" : ready, "change" : "ready"});
        socket.broadcast.emit("update", {"ready" : ready, "change" : "ready"});
      });
    });
  });
  let cam = child.exec("webcam.exe", function(){});
  cam.stdout.on("data", function(data){
    let imgNum = parseInt(data.substr(1));
    if(!isNaN(imgNum)){
      getPixels("image" + imgNum + ".png", function(err, pixels) {
        if(err) {
          console.log("Bad image path");
        }
        else{
          webcam = Array.from(pixels.data);
        }
      });
    }
  });
  let tmpHum = child.exec("node temphum.js", function(){});
  tmpHum.stdout.on("data", function(data){
    //Receive Temp Hum Data
    console.log(data);
  });
  let altAzi = child.exec("node altazi.js", function(){});
  altAzi.stdout.on("data", function(data){
    //Recieve Alt Azi Data
  });
  console.log("Server active at " + getIPAddress() + ":" + port);
};

init();
