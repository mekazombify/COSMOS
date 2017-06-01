"use strict";

let child = require("child_process");
let spawn = child.spawn("node", ["tempHum.js"]);

let temp;
let hum;

spawn.stdout.on('data', (data) => {
  temp = `${data}`;
  hum = temp.split("\n")[0].split(", ")[1];
  temp = temp.split("\n")[0].split(", ")[0];
  console.log("Temperature: " + temp);
  console.log("Humidity: " + hum);
});
