var express = require('express');
var Profile = require('../models/Profile');
var router = express.Router();

/* GET users listing. */
router.get('/:resource', function(req, res, next) {

	var resource = req.params.resource;
	if (resource=='profiles'){
		Profile.find(req.query, function(err, profiles) {
			if (err){
				res.json({'confirmation':'fail','message':err});
				return next(err);
			}

			var results = new Array();
			for (var i=0; i<profiles.length; i++){
				var p = profiles[i];
				results.push(p.summary());
			}

			res.json({'confirmation':'success', "profiles":results});
		});
		return;
	}
});

router.get('/:resource/:id', function(req, res, next) {

	var resource = req.params.resource;
	var identifier = req.params.id;

  	if (resource=='profiles'){
  		Profile.findById(identifier, function(err, profile) {
			if (err){
				res.send({'confirmation':'fail','message':"Profile "+identifier+" not found"});
				return next(err);
			}
			res.json({'confirmation':'success', "profile":profile.summary()});
		});
		return;
  	}
});

router.post('/:resource', function(req, res, next) {
	var resource = req.params.resource;
	if (resource == 'profiles'){
		Profile.create(req.body, function(err, profile){
			if (err){
				res.send({'confirmation':'fail', 'message':err.message});
				return next(err);
			}
			res.json({'confirmation':'success', 'profile':profile.summary()});
		});
		return;
	}
});

module.exports = router;
