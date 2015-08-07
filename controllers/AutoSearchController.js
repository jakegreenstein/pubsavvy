var AutoSearch = require('../models/AutoSearch.js');
var mongoose = require('mongoose');



this.handleGet = function(req, res, pkg){
	console.log('AutoSearch CONTROLLER: Handel GET');

	// fetch specific autoSearch by ID:
	if (pkg.id != null){ 
		AutoSearch.findById(pkg.id, function(err, autosearch) {
			if (err){
				res.send({'confirmation':'fail','message':"AutoSearch "+pkg.id+" not found"});
				return;
			}
			res.json({'confirmation':'success', "autosearch":autosearch.summary()});
		});
		return;
	}

	AutoSearch.find(req.query, function(err, autosearches){
		if (err){
			res.json({'confirmation':'fail','message':err.message});
			return;
		}
		var results = new Array();
		for (var i=0; i<autosearches.length; i++){
			var p = autosearches[i];
			results.push(p.summary());
		}
		res.json({'confirmation':'success', 'autosearches':results});
	});
	return;
}


this.handlePost = function(req, res, pkg){
	console.log('AutoSearch CONTROLLER: Handel POST');
	AutoSearch.create(req.body, function(err, autosearch){
		if (err){
			res.send({'confirmation':'fail', 'message':err.message});
			return;
		}
		
		res.json({'confirmation':'success', 'autosearch':autosearch.summary()});
	});
	return;
}



this.handlePut = function(req, res, pkg){
	console.log('AutoSearch CONTROLLER: Handel PUT');
		var query = {_id: pkg.id};
		var options = {new: true};		
		
		AutoSearch.findOneAndUpdate(query, req.body, options,function(err, autosearch){
			if (err){
				res.send({'confirmation':'fail', 'message':err.message});
				return;
			}
			
			res.json({'confirmation':'success', 'autosearch':autosearch.summary()});
		});
		return;

}



