/*
Cloud Forecasting Module
Frank Giddens
March 24, 2017
*/

"use strict";

let getPixels = require("get-pixels");

let baker = [230, 323];
let legend = [];
let legDif = [];
let cloudPct;
let forecast = "";
let subcast = "0";
let today = new Date();
setInterval(function(){
	while(legend.length > 0){
		legend.shift();
	}
	while(legDif.length > 0){
		legDif.shift();
	}
	forecast = "";
	subcast = "0";
	today = new Date();
	forecast += today.getUTCFullYear();
	if(today.getUTCMonth() < 9){
		forecast += "0";
	}
	forecast += (today.getUTCMonth() + 1);
	if(today.getUTCDate() < 10){
		forecast += "0";
	}
	forecast += today.getUTCDate();
	if(today.getUTCHours() > 2 && today.getUTCHours < 15){
		forecast += "00";
	}
	else{
		forecast += "12";
	}
	if((today.getUTCHours() > 2 && today.getUTCHours() < 10) || (today.getUTCHours() > 14 && today.getUTCHours() < 22)){
		subcast += "0";
	}
	if(today.getUTCHours() < 3){
		subcast += today.getUTCHours() + 12;
	}
	else if(today.getUTCHours() > 14){
		subcast += today.getUTCHours() - 12;
	}
	else{
		subcast += today.getUTCHours();
	}
	for(let i = 0; i < 40; i++){
		legend.push([666, 236 + (i * 8)]);
	}
	getPixels("https://weather.gc.ca/data/prog/regional/" + forecast + "/" + forecast + "_054_R1_north@america@southeast_I_ASTRO_nt_" + subcast + ".png", function(err, pixels){
		if(err){
			console.log("ERROR");
		}
		else{
			for(let i = 0; i < legend.length; i++){
				legDif.push(Math.abs(pixels.data[baker[0] + (baker[1] * pixels.shape[0]) + 1] - pixels.data[legend[i][0] + (legend[i][1] * pixels.shape[0]) + 1]) + Math.abs(pixels.data[baker[0] + (baker[1] * pixels.shape[0]) + 2] - pixels.data[legend[i][0] + (legend[i][1] * pixels.shape[0]) + 2]) + Math.abs(pixels.data[baker[0] + (baker[1] * pixels.shape[0]) + 3] - pixels.data[legend[i][0] + (legend[i][1] * pixels.shape[0]) + 3]));
				if(legDif.length === legend.length - 1){
					cloudPct = 0;
					for(let j = 0; j < legDif.length; j++){
						if(legDif[j] < legDif[cloudPct]){
							cloudPct = j;
						}
						if(j === legDif.length - 1){
							cloudPct = 100 - (cloudPct * 2.5);
							console.log(cloudPct);
						}
					}
				}
			}
		}
	});
}, 60000);
forecast += today.getUTCFullYear();
if(today.getUTCMonth() < 9){
	forecast += "0";
}
forecast += (today.getUTCMonth() + 1);
if(today.getUTCDate() < 10){
	forecast += "0";
}
forecast += today.getUTCDate();
if(today.getUTCHours() > 3 && today.getUTCHours < 16){
	forecast += "00";
}
else{
	forecast += "12";
}
if((today.getUTCHours() > 2 && today.getUTCHours() < 10) || (today.getUTCHours() > 14 && today.getUTCHours() < 22)){
	subcast += "0";
}
if(today.getUTCHours() < 3){
	subcast += today.getUTCHours() + 12;
}
else if(today.getUTCHours() > 15){
	subcast += today.getUTCHours() - 12;
}
else{
	subcast += today.getUTCHours();
}
for(let i = 0; i < 40; i++){
	legend.push([666, 236 + (i * 8)]);
}
getPixels("https://weather.gc.ca/data/prog/regional/" + forecast + "/" + forecast + "_054_R1_north@america@southeast_I_ASTRO_nt_" + subcast + ".png", function(err, pixels){
	if(err){
		console.log("ERROR");
	}
	else{
		for(let i = 0; i < legend.length; i++){
			legDif.push(Math.abs(pixels.data[baker[0] + (baker[1] * pixels.shape[0]) + 1] - pixels.data[legend[i][0] + (legend[i][1] * pixels.shape[0]) + 1]) + Math.abs(pixels.data[baker[0] + (baker[1] * pixels.shape[0]) + 2] - pixels.data[legend[i][0] + (legend[i][1] * pixels.shape[0]) + 2]) + Math.abs(pixels.data[baker[0] + (baker[1] * pixels.shape[0]) + 3] - pixels.data[legend[i][0] + (legend[i][1] * pixels.shape[0]) + 3]));
			if(legDif.length === legend.length - 1){
				cloudPct = 0;
				for(let j = 0; j < legDif.length; j++){
					if(legDif[j] < legDif[cloudPct]){
						cloudPct = j;
					}
					if(j === legDif.length - 1){
						cloudPct = 100 - (cloudPct * 2.5);
						console.log(cloudPct);
					}
				}
			}
		}
	}
});