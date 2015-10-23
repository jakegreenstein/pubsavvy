var express = require('express');
var router = express.Router();
var fs = require('fs');
var Promise = require('bluebird');
var accountController = require('../controllers/AccountController.js');
var deviceController = require('../controllers/DeviceController.js');
var profileController = require('../controllers/ProfileController.js');
var autosearchController = require('../controllers/AutoSearchController.js');
var articleController = require('../controllers/ArticleController.js');
var questionController = require('../controllers/QuestionController.js');

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
 	'related':articleController, 
 	'question': questionController
 };



/* GET users listing. */
router.get('/:resource', function(req, res, next) {
	if (req.params.resource == 'sendgrid'){ 
			var recipient = req.query.email;
			if (recipient == null){
					res.json({'confirmation':'fail', 'message':'You forgot the email address dummy.'});
					return;
			}


			var sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
			sendgrid.send({
					to:       recipient,
					from:     'info@thegridmedia.com',
					fromname: 'PUB SAVVY',
					subject:  'WELCOME TO PUB SAVVY',
					text:     'This is the welcome message!'
			}, function(err, json) {
				if (err) {
					res.json({'confirmation':'fail', 'message':err});
					return;
				}

				res.json({'confirmation':'success', 'message':'Email sent to '+recipient});
				return;
			});

		return;
	}


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
	console.log('POST: '+JSON.stringify(req.params));
	
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


router.delete('/:resource/:id', function(req, res, next) {
	console.log('made it to router.delete in api.js')
 var controller = controllers[req.params.resource];
	if (controller == null){
		res.send({'confirmation':'fail', 'message':'Invalid Resource: '+req.params.resource});
		return;
	}
	
	if (req.params.id == null){
		res.send({'confirmation':'fail', 'message':'Missing resource identiifer.'});
		return;
	}
	console.log(req.params.id);
	controller.handleDelete(req, res, {'id':req.params.id, 'parameters':req.query});
  	
});


var fetchFile = function(path){
	return new Promise(function (resolve, reject){

		fs.readFile(path, 'utf8', function (err, data) {
			if (err) {reject(err); }
			else { resolve(data); }
		});
	});
}

module.exports = router;
