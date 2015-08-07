var Device = require('../models/Device.js');
var mongoose = require('mongoose');



this.handleGet = function(req, res, pkg){
	console.log('Device CONTROLLER: Handel GET');

	// fetch specific device by ID:
	if (pkg.id != null){ 
		Device.findById(pkg.id, function(err, device){
			if (err){
				res.send({'confirmation':'fail','message':"Device "+identifier+" not found"});
				return;
			}
			if (device == null){
				res.send({'confirmation':'fail','message':"Device "+identifier+" not found"});
				return;
			}
			res.json({'confirmation':'success', 'device':device.summary()});
		});
		return;
	}

	Device.find(req.query,{}, { sort: { 'timestamp' : -1 } }, function(err, devices){
		if (err){
			res.json({'confirmation':'fail','message':err.message});
			return;
		}
		var results = new Array();
		for (var i=0; i<devices.length; i++){
			var p = devices[i];
			results.push(p.summary());
		}

		res.json({'confirmation':'success', 'devices':results});
	});
}


this.handlePost = function(req, res, pkg){

}



function convertToJson(profiles){
	var results = new Array();
    for (var i=0; i<profiles.length; i++){
  	  var p = profiles[i];
  	  results.push(p.summary());
    }
	
	return results;
}



