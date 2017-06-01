/*
ClientJS
Frank Giddens
February 17, 2017
*/

"use strict";

let socket = io.connect();
let temp = "N/A";
let hum = "N/A";
let pwr = "N/A";
let cloud = "N/A";
let roof = "N/A";

document.getElementById("addNode").addEventListener("click", function(){
  socket.emit("addNode", {"ip" : document.getElementById("newIP").value});
});

document.getElementById("moveRoof").addEventListener("click", function(){
  socket.emit("moveRoof", {"position" : roof});
});

socket.on("nodeList", function(data){
  document.getElementById("nodeList").innerHTML = "<h2>Connected Nodes</h2>";
  for(let i = 0; i < data.nodes.length; i++){
    document.getElementById("nodeList").innerHTML += "<div>" + data.nodes[i] + "<button id=\"details" + i + "\">Details</button></div>";
  }
  //Looks broken, works, don't touch
  for(let i = 0; i < data.nodes.length; i++){
    document.getElementById("details" + i).addEventListener("click", function(){
      socket.emit("reqDetails", {"node" : data.nodes[i]});
    });
  }
});

socket.on("nodeDetails", function(data){
  console.log("Node Details Loaded");
});

socket.on("weatherData", function(data){
  console.log(data);
  temp = data.temp;
  hum = data.hum;
  pwr = data.battery.charging;
  cloud = data.cloudPct;
  switch(pwr){
    case "N/A":
      document.getElementById("domeStatus").innerHTML = "<h2>Dome Status</h2>" + temp + " Celsius<br/>" + hum + "% Humidity<br/>" + cloud + "% Clouds<br/>Unknown Power Status<br/><a href=\"tempHumLog.csv\" download>Download Log</a>";
      break;
    case true:
      document.getElementById("domeStatus").innerHTML = "<h2>Dome Status</h2>" + temp + " Celsius<br/>" + hum + "% Humidity<br/>" + cloud + "% Clouds<br/>Power Active<br/><a href=\"tempHumLog.csv\" download>Download Log</a>";
      break;
    case false:
      document.getElementById("domeStatus").innerHTML = "<h2>Dome Status</h2>" + temp + " Celsius<br/>" + hum + "% Humidity<br/>" + cloud + "% Clouds<br/>Power Inactive<br/><a href=\"tempHumLog.csv\" download>Download Log</a>";
      break;
    default:
      document.getElementById("domeStatus").innerHTML = "<h2>Dome Status</h2>" + temp + " Celsius<br/>" + hum + "% Humidity<br/>" + cloud + "% Clouds<br/>Unknown Power Status<br/><a href=\"tempHumLog.csv\" download>Download Log</a>";
  }
});
