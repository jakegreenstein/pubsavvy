var express = require('express');
var router = express.Router();

var accountController = require('../controllers/AccountController.js');
var deviceController = require('../controllers/DeviceController.js');
var profileController = require('../controllers/ProfileController.js');
var autosearchController = require('../controllers/AutoSearchController.js');
var articleController = require('../controllers/ArticleController.js');

var controllers = {
	'account':accountController,
 	'currentuser':accountController,
 	'logout':accountController,
 	'login':accountController,
 	'device':deviceController, 
 	'profile':profileController, 
 	'autosearch':autosearchController, 
 	'article':articleController,
 	'search':articleController,
 	'related':articleController
 };


router.get('/:resource', function(req, res, next) {

	if (req.params.resource == 'sendgrid'){ 
		fetchFile('public/email/welcome.html')
		.then(function(data){
			var sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
			sendgrid.send({
				to:       'sarahsalder@gmail.com',
				from:     'info@thegridmedia.com',
				fromname: 'PubSavvySwipe',
				subject:  'WELCOME TO PUBSAVVYSWIPE',
				html:     data
			}, function(err, json) {
				if (err) {
					res.json({'confirmation':'fail', 'message':err});
					return;
				}

				res.json({'confirmation':'success', 'message':'Email sent to dan.kwon234@gmail.com'});
				return;
			});
		
		})
		.catch(function(err){
			res.json({'confirmation':'fail','message':err.message});
			return;
		});

		return;
	}
	controller.handleGet(req, res, {'id':null, 'parameters':req.query});
});




/* GET users listing. */
router.get('/:resource', function(req, res, next) {

	var controller = controllers[req.params.resource];
	if (controller == null){
		res.send({'confirmation':'fail', 'message':'Invalid Resource: '+req.params.resource});
		return;
	}
	
	controller.handleGet(req, res, {'id':null, 'parameters':req.query});

});


router.get('/:resource/:id', function(req, res, next) {

  	var controller = controllers[req.params.resource];
	if (controller == null){
		res.send({'confirmation':'fail', 'message':'Invalid Resource: '+req.params.resource});
		return;
	}
	
	controller.handleGet(req, res, {'id':req.params.id, 'parameters':req.query});
  	
});


router.post('/:resource', function(req, res, next) {
	
	var controller = controllers[req.params.resource];
	if (controller == null){
		res.send({'confirmation':'fail', 'message':'Invalid Resource: '+req.params.resource});
		return;
	}
	controller.handlePost(req, res, {'id':null, 'parameters':req.query});

});


router.put('/:resource/:id', function(req, res, next) {
	
	//CONTROLLERS
	var controller = controllers[req.params.resource];
	if (controller == null){
		res.send({'confirmation':'fail', 'message':'Invalid Resource: '+req.params.resource});
		return;
	}
	
	if (req.params.id == null){
		res.send({'confirmation':'fail', 'message':'Missing resource identiifer.'});
		return;
	}
	controller.handlePut(req, res, {'id':req.params.id, 'parameters':req.query});


});

module.exports = router;
