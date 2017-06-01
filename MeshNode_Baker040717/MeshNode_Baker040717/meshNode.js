/*
Mesh Nodes
Frank Giddens
February 24, 2017
*/

"use strict";

let fs = require("fs");
let url = require("url");
let http = require("http");
let child = require("child_process");
let ios = require("socket.io");
let ioc = require("socket.io-client");
let batteryLevel = require("battery-level");
let charging = require("is-charging");

let server;
let listener;
let port = 8080;
let network = [];
let serverSockets = [];
let history = [];
let spawn = [];
let buildString = "";
let temp;
let tempWC;
let hum;
let humWC;
let tmp;
let curr = "";
let time = new Date();
let battery = {"charging" : "N/A", "level" : "N/A"};
let cloudPct;
let prevTime = Date.now();
let curTime = Date.now();

let getIPAddress = function(){
  let address = "127.0.0.1";
  let interfaces = require("os").networkInterfaces();
  for(let devName in interfaces){
    let iface = interfaces[devName];
    for(let i = 0; i < iface.length; i++){
      let alias = iface[i];
      if(alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal){
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
      res.writeHead(404, {'Content-Type' : 'text/html'});
    }
    else{
      switch(pathname.substr(pathname.lastIndexOf(".") + 1)){
        case "css":
          res.writeHead(200, {'Content-Type' : 'text/css'});
          res.write(data.toString());
          break;
	case "csv":
          res.writeHead(200, {'Content-Type' : 'text/csv'});
          res.write(data.toString());
          break;
        case "html":
          res.writeHead(200, {'Content-Type' : 'text/html'});
          res.write(data.toString());
          break;
        case "js":
          res.writeHead(200, {'Content-Type' : 'text/js'});
          res.write(data.toString());
          break;
      }
    }
    res.end();
  });
};

let loadHardware = function(){
  fs.readFile("setup.json", function(err, data){
    if(err){
      console.log("Error Loading File: setup.json");
    }
    else{
      for(let i = 0; i < JSON.parse(data.toString()).hardware.length; i++){
        if(JSON.parse(data.toString()).hardware[i] == "tempHum.js"){
          spawn.push(child.spawn("node", ["tempHum.js"]));
          spawn[0].stdout.on('data', function(data){
            temp = `${data}`;
            hum = temp.split("\n")[0].split(", ")[1];
            temp = temp.split("\n")[0].split(", ")[0];
            curTime = Date.now();
            time = new Date();
            if(curTime - prevTime >= 60000){
              fs.appendFile("tempHumLog.csv", time.getUTCFullYear() + "," + time.getUTCMonth() + "," + time.getUTCDate() + "," + time.getUTCHours() + "," + time.getUTCMinutes() + "," + time.getUTCSeconds() + "," + temp + "," + tempWC + "," + hum.substr(0, hum.length - 1) + "," + humWC + "," + battery.level + "," + battery.charging + "," + cloudPct + "\n", function(){});
              prevTime = curTime;
            }
          });
          spawn.push(child.spawn("node", ["cloudForecast.js"]));
          spawn[1].stdout.on('data', function(data){
            cloudPct = `${data}`;
          });
          spawn.push(child.spawn("node", ["weatherChannel.js"]));
          spawn[2].stdout.on('data', function(data){
            tmp = `${data}`;
            tmp = JSON.parse(tmp);
            tempWC = tmp.temp;
            humWC = tmp.hum;
          });
        }
      }
    }
  });
};

let init = function(){
  server = http.createServer(handleRequest);
  server.listen(port);
  listener = ios.listen(server);
  setInterval(function(){
    batteryLevel().then(result => {
      battery.level = result;
    }).then(charging().then(results => {
      battery.charging = results;
    }));
  }, 5000);
  loadHardware();
  fs.readFile("connections.json", function(err, data){
    if(err){
      console.log("Error Loading File: connections.json");
    }
    else{
      for(let i = 0; i < JSON.parse(data.toString()).history.length; i++){
        network.push(JSON.parse(data.toString()).history[i]);
        serverSockets.push(ioc.connect(network[network.length - 1], {reconnect : true}));
      }
    }
  });
  listener.sockets.on("connection", function(socket){
    socket.emit("nodeList", {"nodes" : network});
    socket.emit("roofInfo", {"position" : roof});
    socket.emit("weatherData", {"temp" : temp, "hum" : hum, "battery" : battery, "cloudPct" : cloudPct});
    setInterval(function(){
      socket.emit("weatherData", {"temp" : temp, "hum" : hum, "battery" : battery, "cloudPct" : cloudPct});
    }, 30000);
    socket.on("addNode", function(data){
      if(network.indexOf(data.ip) === -1){
        network.push(data.ip);
        serverSockets.push(ioc.connect(data.ip, {reconnect : true}));
        serverSockets[serverSockets.length - 1].emit("networkMap", {"map" : network});
        socket.emit("nodeList", {"nodes" : network});
      }
      if(history.indexOf(data.ip) === -1 && data.ip !== (getIPAddress() + ":" + port)){
        history.push(data.ip);
        buildString = "[";
        for(let i = 0; i < history.length; i++){
          buildString += "\"" + history[i] + "\"";
          if(i < history.length - 1){
            buildString += ", ";
          }
        }
        buildString += "]";
        fs.writeFile("connections.json", "{\n\"history\" : " + buildString + "\n}");
      }
    });
    socket.on("moveRoof", function(data){
      if(data.position == "open"){

      }
      else{

      }
    });
    socket.on("passModule", function(data){
      if(data.ip == network[0]){
        buildString = "";
        buildString += data.module;
        for(let i = 0; i < data.options.length; i++){
          buildString += " " + data.options[i];
        }
        child.exec(buildString);
      }
      else{
        for(let i = 1; i < network.length; i++){
          if(data.ip == network[i]){
            serverSockets[i - 1].emit("runModule", {"module" : data.module, "options" : data.options});
            i = network.length;
          }
        }
      }
    });
    socket.on("runModule", function(data){
      buildString = "";
      buildString += data.module;
      for(let i = 0; i < data.options.length; i++){
        buildString += " " + data.options[i];
      }
      child.exec(buildString);
    });
    socket.on("reqDetails", function(data){
      console.log(data.node);
      //load information

      socket.emit("nodeDetails", {});
    });
    socket.on("weatherData", function(data){
      temp = data.temp;
      hum = data.hum;
    });
    socket.on("disconnect", function(){
      let i = serverSockets.indexOf(socket);
      if(i !== -1){
        network.splice(i + 1, 1);
        serverSockets.splice(i, 1);
      }
    });
  });
  network.push(getIPAddress() + ":" + port);
  console.log("Server active at " + getIPAddress() + ":" + port);
};

init();
