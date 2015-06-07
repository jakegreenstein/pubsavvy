var express = require('express');
var request = require('request');
var xmlToJson = require('xml2js');
var Profile = require('../models/Profile');
var router = express.Router();


function urlRequest(url, completion){
	request.get(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var parseString = xmlToJson.parseString;
			parseString(body, function (err, result) {
				if (err){
					console.log(err.message);
					return;
				}
				 	
			    console.log(result);
				
				if (completion != null)
					completion(result);
				
				return;
			});
	    }
	});
	
}

/* GET users listing. */
router.get('/:resource', function(req, res, next) {

	var resource = req.params.resource;
	if (resource == 'search'){
		console.log('SEARCH: '+JSON.stringify(req.query));
		
		var baseUrl = 'http://www.ncbi.nlm.nih.gov/entrez/eutils/';
		var url = baseUrl+'esearch.fcgi?db=pubmed&term='+req.query.term+'&usehistory=y&retmax=100';
		var results = urlRequest(url, function(results){
			var eSearchResult = results.eSearchResult;
			var webEnv = eSearchResult.WebEnv;
			console.log('WEB ENV: '+webEnv);
			
			var nextReq = baseUrl+'efetch.fcgi?db=Pubmed&retstart=0&retmax=100&usehistory=y&query_key=1&WebEnv='+webEnv+'&reldate=36500&retmode=xml';
			urlRequest(nextReq, function(results){
				res.setHeader('content-type', 'application/json');
				var json = JSON.stringify({'confirmation':'sucess','results':results}, null, 2); // this makes the json 'pretty' by indenting it
				res.send(json);
				return;
			});
		});
		
		return;
	}
	
	
	
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
