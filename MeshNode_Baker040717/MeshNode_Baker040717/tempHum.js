"use strict";

let serial = require("serialport");
let port = new serial("COM3", {parser: serial.parsers.readline('\n')});

port.on("data", function(data){
  console.log(data);
});
