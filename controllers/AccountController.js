var Profile = require('../models/Profile.js');
var mongoose = require('mongoose');



function checkCurrentUser(req, res){
	if (!req.session){
		res.send({'confirmation':'fail', 'message':'User not logged in.'});
		return;
	}

	if (!req.session.user){
		res.send({'confirmation':'fail', 'message':'User not logged in.'});
		return;
	}

	var userId = req.session.user;
	console.log('USER '+userId+' LOGGED IN');
	
	Profile.findById(userId, function(err, profile){
		if (err){
			req.session.reset();
			res.send({'confirmation':'fail', 'message':'Profile '+userId+' not found'});
			return;
		}
		
		if (profile == null){
			res.send({'confirmation':'fail', 'message':'Profile '+userId+' not found'});
			return;
		}

		res.json({'confirmation':'success', 'profile':profile.summary()});
		return;
	});
	return;
}

function login(req, res){
	var email = req.body.email;
	var password = req.body.password;
	console.log('LOG IN: '+email+' && '+password);
  
	Profile.findOne({'email':email}, function(err, profile){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
		if (profile == null){
			res.json({'confirmation':'fail', 'message':'Profile with email '+email+' not found.'});
			return;
		}
		
		if (password != profile.password){
			res.json({'confirmation':'fail', 'message':'Incorrect password.'});
			return;
		}
		
		req.session.user = profile._id; // install cookie with profile id set to 'user'
	  	res.json({'confirmation':'success', 'profile':profile.summary()});
	  	return;
	});
	return;
}

function logout(req, res){
	req.session.reset();

  	// if(req.session.user != undefined){
  	// 	res.json({'confirmation':'fail', 'message':'logout unsuccessful'});
  	// 	return;
  	// }
  	
  	res.json({'confirmation':'success'});
  	return;
}

this.handleGet = function(req, res, pkg){

	if (req.params.resource == 'currentuser'){
		checkCurrentUser(req, res);
		return;
	}

	if (req.params.resource == 'logout'){
  		logout(req,res);
  		return;
	}

	
	if (pkg.id != null){
		Profile.findById(pkg.id, function(err, profile){
			if (err){
				res.send({'confirmation':'fail', 'message':'Profile '+pkg.id+' not found'});
				return next(err);
			}

			res.json({'confirmation':'success', 'profile':profile.summary()});
		});
		return;
	}
	
	var keys = Object.keys(req.query).length;
	console.log(keys+' KEYS');
	
	if (keys==0){ // no params, fetch all!
		Profile.find(function(err, profiles){
			if (err){
				res.send({'confirmation':'fail', 'message':'error'});
				return next(err);
			}
			
			res.json({"profiles":convertToJson(profiles)});
		});
		return;
	}
	
	/* Query by filters passed into parameter string: */
	Profile.find(req.query, function(err, profiles) {
	  if (err) {
		res.send({'confirmation':'fail', 'message':err});
		return next(err);
	  }
  
	  res.json({"profiles":convertToJson(profiles)});
	});
}


this.handlePost = function(req, res, pkg){

	if(req.params.resource == 'login'){
		login(req, res);
		return;
	}

	Profile.create(req.body, function(err, profile){
		if (err){
			res.send({'confirmation':'fail', 'message':err});
			return next(err);
		}
		
	  	res.json({'confirmation':'success', 'profile':profile.summary()});
	});
}



function convertToJson(profiles){
	var results = new Array();
    for (var i=0; i<profiles.length; i++){
  	  var p = profiles[i];
  	  results.push(p.summary());
    }
	
	return results;
}



