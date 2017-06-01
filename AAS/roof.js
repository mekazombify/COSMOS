/*
Roof Module
Frank Giddens
November 8, 2016
*/

"use strict"

let serial = require("serialport");
let port = new serial("COM6");

port.on("open", function(){
  setTimeout(function(){
    port.write("Open");
    setTimeout(function(){
      port.write("Stop");
    }, 60000);
    setInterval(function(){
      port.flush();
      port.write("Status");
    }, 1000);
  }, 3000);
});
