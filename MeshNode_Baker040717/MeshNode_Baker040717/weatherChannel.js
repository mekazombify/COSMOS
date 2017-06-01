/*
Weather Channel
Frank Giddens
March 30, 2017
*/

"use strict";

let request = require("request");

request('http://www.wunderground.com/cgi-bin/findweather/getForecast?query=37.387653,-93.148788', function(error, response, body){
	let scripts = body.split("<script>");
	let data = JSON.parse(scripts[4].substring(scripts[4].indexOf("{"), scripts[4].lastIndexOf("}") + 1));
	let temp = (data.current_observation.temperature - 32) * 5 / 9;
	let hum = data.current_observation.humidity;
	let output = JSON.stringify({"temp" : temp, "hum" : hum});
	console.log(output);
});

setInterval(function(){
	request('http://www.wunderground.com/cgi-bin/findweather/getForecast?query=37.387653,-93.148788', function(error, response, body){
		let scripts = body.split("<script>");
		let data = JSON.parse(scripts[4].substring(scripts[4].indexOf("{"), scripts[4].lastIndexOf("}") + 1));
		let temp = (data.current_observation.temperature - 32) * 5 / 9;
		let hum = data.current_observation.humidity;
		let output = JSON.stringify({"temp" : temp, "hum" : hum});
		console.log(output);
	});
}, 60000);