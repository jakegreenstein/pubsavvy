var Profile = require('../models/Profile.js');
var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:page', function(req, res, next) {

	if (!req.session){
		res.send({'confirmation':'fail', 'message':'User not logged in.'});
		return;
	}

	if (!req.session.user){
		res.send({'confirmation':'fail', 'message':'User not logged in.'});
		return;
	}

	var userId = req.session.user;

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

		var authorized = ['dianaframe@gmail.com', 'dianaframe@earthlink.net'];
		if (authorized.indexOf(profile.email) == -1){
			res.send({'confirmation':'fail', 'message':'Unauthorized'});
			return;
		}

		var page = req.params.page;
		res.render('admin/'+page, {'title':page.toUpperCase()});
		return;
	});






});

module.exports = router;
