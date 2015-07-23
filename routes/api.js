var express = require('express');
var request = require('request');
var xmlToJson = require('xml2js');
var Promise = require('bluebird');
var Profile = require('../models/Profile');
var Device = require('../models/Device');
var AutoSearch = require('../models/AutoSearch');
var router = express.Router();

var accountController = require('../controllers/AccountController.js');
var controllers = {'account':accountController};

function urlRequest(url, completion){
	request.get(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var parseString = xmlToJson.parseString;
			parseString(body, function (err, result) {
				if (err){
					console.log(err.message);
					completion(err, null)
					return;
				}
				 	
			    console.log('results');
				
				if (completion != null)
					completion(null, result);
				
				return;
			});
	    }
	});
}

function cleanUpResults(articles){
	var list = new Array();
	
	var months = ['Jan', 'Feb', 'Mac', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	for (var i=0; i<articles.length; i++){
		var summary = {};
		var result = articles[i];
		var MedlineCitation = result['MedlineCitation']; // this is an array of dictionaries
	
		var meta = MedlineCitation[0];
		var article = meta['$']; // actual article meta is first item in the array
	
		var pmid = meta['PMID'][0]; // array
		summary['pmid'] = pmid['_'];
	
		var dateCreated = meta['DateCreated'][0]; 
		summary['date'] = months[dateCreated['Month'][0]-1]+' '+dateCreated['Day'][0]+' '+dateCreated['Year'][0];
	
		if (meta['DateRevised'] != null){
			var dateRevised = meta['DateRevised'][0]; 
			summary['dateRevised'] = months[dateRevised['Month'][0]-1]+' '+dateRevised['Day'][0]+' '+dateRevised['Year'][0];
		}
	
	
		var articleSummary = meta['Article'][0]; 

		if(meta['KeywordList'] != null){
			var keywordList = meta['KeywordList'][0]; 
			var keywords = new Array();

			for(var q=0; q < keywordList.Keyword.length; q++){
				keywords.push(keywordList.Keyword[q]['_']);
			}

			summary['keywords'] = keywords;
		}
	
		var journal = articleSummary['Journal'][0];
		var journalInfo = {};
		if (journal['Title'] != null)
			journalInfo['title'] = journal['Title'][0];

		if (journal['ISOAbbreviation'] != null)
			journalInfo['iso'] = journal['ISOAbbreviation'][0];

		if (journal['ISSN'] != null)
			journalInfo['issn'] = journal['ISSN'][0]['_'];
	
	
		summary['journal'] = journalInfo;
	
		summary['title'] = articleSummary['ArticleTitle'][0];
	
		if (articleSummary['Abstract'] == null) // not always there
			summary['abstract'] = 'null';
		else{
			if( articleSummary['Abstract'][0]['AbstractText'][0]['_'] == null)
				summary['abstract'] = articleSummary['Abstract'][0]['AbstractText'][0];
			else
				summary['abstract'] = articleSummary['Abstract'][0]['AbstractText'][0]['_'];
		}
	
		var authors = new Array();
		if (articleSummary['AuthorList'] != null){
			var authorList = articleSummary['AuthorList'][0]['Author'];
			for (var j=0; j<authorList.length; j++){
				var author = authorList[j];
		
				var authorInfo = {};
				if (author['LastName'] != null)
					authorInfo['lastName'] = author['LastName'][0];

				if (author['ForeName'] != null)
					authorInfo['firstName'] = author['ForeName'][0];

				if (author['AffiliationInfo'] != null)
					authorInfo['affiliation'] = author['AffiliationInfo'][0]['Affiliation'][0];
			
		
				authors.push(authorInfo);
			}
		}

	
		summary['authors'] = authors;
	
		if (articleSummary['Language'] != null) // not always there
			summary['language'] = articleSummary['Language'][0];

	
		list.push(summary);
	}
	
	return list;
}

var relatedArticlesRequest = function(pmid){
	return new Promise(function (resolve, reject){
		var url = 'http://www.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&db=pubmed&id='+pmid;
		urlRequest(url, function(err, results){
			if (err) { reject(err); }
			else { resolve(results); }
		
		});
	});
}

var searchRequest = function(searchTerm){
	return new Promise(function (resolve, reject){

		var baseUrl = 'http://www.ncbi.nlm.nih.gov/entrez/eutils/';
		var url = baseUrl+'esearch.fcgi?db=pubmed&term='+searchTerm+'&usehistory=y&retmax=100';
		urlRequest(url, function(err, results){
			if (err) { reject(err); }
			else { resolve(results); }
		});
	});
}

var followUpRequest = function(results, offset, limit){
	return new Promise(function (resolve, reject){
		var baseUrl = 'http://www.ncbi.nlm.nih.gov/entrez/eutils/';
		
		var eSearchResult = results.eSearchResult;
		var count = eSearchResult['Count'][0];
		var webEnv = eSearchResult.WebEnv;
		
		var nextReq = baseUrl+'efetch.fcgi?db=Pubmed&retstart='+offset+'&retmax='+limit+'&usehistory=y&query_key=1&WebEnv='+webEnv+'&reldate=36500&retmode=xml';
		urlRequest(nextReq, function(err, results){
			if (err) { reject(err); }
			else{
				var PubmedArticleSet = results['PubmedArticleSet'];
				var articles = PubmedArticleSet['PubmedArticle'];
				resolve({'count':count, 'list':articles});
			}
		});
	});
}

var updateDeviceSearchHistory = function(results, req){
	return new Promise(function (resolve, reject){
		if (req.query.device==null){
			resolve(results);
			return;
		}
		
		Device.findById(req.query.device, function(err, device){
			if (err){
				resolve(results);
				return;
			}
			
			var searchTerm = req.query.term;
			var searchHistory = device.searchHistory;
			searchHistory[searchTerm] = (searchHistory[searchTerm]==null) ? 1 : searchHistory[searchTerm]+1;

			device['searchHistory'] = searchHistory;
			device.markModified('searchHistory'); // EXTREMELY IMPORTANT: In Mongoose, 'mixed' object properties don't save automatically - you have to mark them as modified:

			device.save(function (err, device){
				if (err){
					resolve(results);
					return;
				}
				
				results['device'] = device.summary();
				resolve(results);
				return;
			});
		});
	});
}


/* GET users listing. */
router.get('/:resource', function(req, res, next) {

	var resource = req.params.resource;
	
	if (resource=='profile'){
		Profile.find(req.query, function(err, profiles) {
			if (err){
				res.json({'confirmation':'fail','message':err.message});
				return;
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

	if (resource=='device'){
		Device.find(req.query, function(err, devices){
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
		
		return;
	}

	if (resource=='addDevice'){
		var temp = {'deviceToken':'token6'};
		Device.create(temp, function(err, device){
			if (err){
				res.send({'confirmation':'fail', 'message':err.message});
				return;
			}
			
			res.json({'confirmation':'success', 'device':device.summary()});
		});
	}

	if (resource=='autosearch'){
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
	
	if (resource == 'search'){
		var searchTerm = req.query.term;
		if (searchTerm==null){
			res.json({'confirmation':'fail', 'message':'Missing search value.'});
			return;
		}
		
		
		searchRequest(searchTerm)
		.then(function(results){
			var offset = (req.query.offset == null)? '0' : req.query.offset;
			var limit = (req.query.limit == null)? '100' : req.query.limit;
			return followUpRequest(results, offset, limit);
		})
		.then(function(results){
			var clean = (req.query.clean == null)? 'yes' : req.query.clean;
			var list = (clean == 'yes') ? cleanUpResults(results.list) : results.list;
			var response = {'confirmation':'success', 'count':results.count, 'results':list};
			return updateDeviceSearchHistory(response, req);
		})
		.then(function(results){
			res.setHeader('content-type', 'application/json');
			
			var json = JSON.stringify(results, null, 2);
			res.send(json);
			return;
		})
		.catch(function(err){
			res.json({'confirmation':'fail','message':err.message});
			return;
		});
	}
	
	if (resource == 'related') {
  		if(req.query.pmid == null){
  			res.json({'confirmation':'fail', 'message':'Missing pmid parameter.'})
  			return;
  		}
		
		
		var url = 'http://www.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&db=pubmed&id='+req.query.pmid;
		urlRequest(url, function(err, results){
			var eLinkResult = results.eLinkResult;
			var linkSetDb = eLinkResult.LinkSet[0].LinkSetDb[0];
			var linkIDs = linkSetDb.Link;

			var numIDs = linkIDs.length;
			var count = numIDs;
			if(100 < numIDs)
				numIDs = 100;

			var linkIDString = linkIDs[0].Id;
			for(var i = 1; i < numIDs; i++)
				linkIDString = linkIDString+','+linkIDs[i].Id;
			
			var nextUrl = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id='+linkIDString;
			urlRequest(nextUrl, function(err, results){
				var clean = req.query.clean;
				if (clean==null)
					clean = 'yes';
				
				
				res.setHeader('content-type', 'application/json');
				if (clean != 'yes'){
					var json = JSON.stringify({'confirmation':'success','count':count, 'results':results}, null, 2); // this makes the json 'pretty' by indenting it
					res.send(json);
					return;
				}
				
				var PubmedArticleSet = results['PubmedArticleSet'];
				var articles = PubmedArticleSet['PubmedArticle'];
				if(articles == null){
					res.json({'confirmation':'fail', 'message':'Invalid pmid'});
  					return;
				}
				var list = cleanUpResults(articles);
				
				// this makes the json 'pretty' by indenting it
				var json = JSON.stringify({'confirmation':'success', 'count':count,  'results':list}, null, 2); 
				res.send(json);
				return;
			
			});
		});		
  	}

  	if(resource == 'article') {
  		if(req.query.pmid == null){
  			res.json({'confirmation':'fail', 'message':'Missing pmid parameter.'});
  			return;
  		}

  		var nextUrl = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id='+req.query.pmid;
		urlRequest(nextUrl, function(err, article){
			var clean = req.query.clean;
			if (clean==null)
				clean = 'yes';
				
				
			res.setHeader('content-type', 'application/json');
			if (clean != 'yes'){
				var json = JSON.stringify({'confirmation':'success', 'article':article}, null, 2); // this makes the json 'pretty' by indenting it
				res.send(json);
				return;
			}
				
			var PubmedArticleSet = article['PubmedArticleSet'];
			var articles = PubmedArticleSet['PubmedArticle'];
			if(articles == null){
				res.json({'confirmation':'fail', 'message':'Invalid pmid'});
  				return;
			}
			var list = cleanUpResults(articles);
				
			// this makes the json 'pretty' by indenting it
			var json = JSON.stringify({'confirmation':'success',  'article':list[0]}, null, 2); 
			res.send(json);
			return;
			
		});
  	}

  	if (resource == 'currentuser'){ // check if current user is logged in
		accountController.checkCurrentUser(req, res);
		return;
	}

	if (resource == 'logout'){
		req.session.reset();
  		//res.redirect('/');
  		console.log(req.session.user);
  		if(req.session.user != undefined){
  			res.json({'confirmation':'fail', 'message':'req.session.user != underfined'});
  			return;
  		}

  		res.json({'confirmation':'success'});
	}

});


router.get('/:resource/:id', function(req, res, next) {
	var resource = req.params.resource;
	var identifier = req.params.id;

  	if (resource=='profile'){
  		Profile.findById(identifier, function(err, profile) {
			if (err){
				res.send({'confirmation':'fail','message':"Profile "+identifier+" not found"});
				return;
			}
			res.json({'confirmation':'success', "profile":profile.summary()});
		});
		return;
  	}
	
  	if (resource=='device'){
		Device.findById(identifier, function(err, device){
			if (err){
				res.send({'confirmation':'fail','message':"Device "+identifier+" not found"});
				return;
			}
			
			res.json({'confirmation':'success', 'device':device.summary()});
		});
	}

	if (resource=='autosearch'){
  		AutoSearch.findById(identifier, function(err, autosearch) {
			if (err){
				res.send({'confirmation':'fail','message':"AutoSearch "+identifier+" not found"});
				return;
			}
			res.json({'confirmation':'success', "autosearch":autosearch.summary()});
		});
		return;
  	}
  	
});


router.post('/:resource', function(req, res, next) {
	var resource = req.params.resource;
	if (resource == 'profile'){
		Profile.create(req.body, function(err, profile){
			if (err){
				res.send({'confirmation':'fail', 'message':err.message});
				return;
			}
			req.session.user = profile._id; // install cookie with profile id set to 'user'
			res.json({'confirmation':'success', 'profile':profile.summary()});
		});
		return;
	}
	
  	if (resource=='device'){
		Device.create(req.body, function(err, device){
			if (err){
				res.json({'confirmation':'fail', 'message':err.message});
				return;
			}
			
			res.json({'confirmation':'success', 'device':device.summary()});
		});
		
		return;
	}

	if (resource=='autosearch'){
		AutoSearch.create(req.body, function(err, autosearch){
			if (err){
				res.send({'confirmation':'fail', 'message':err.message});
				return;
			}
			
			res.json({'confirmation':'success', 'autosearch':autosearch.summary()});
		});
	}

	if (resource == 'login'){
		var email = req.body.email;
		var password = req.body.password;
		console.log('LOG IN: '+email+' && '+password);
	  	// res.json({'confirmation':'success', 'profile':req.body});
		
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
		});
		
		return;
	}

});


router.put('/:resource/:id', function(req, res, next) {
	var resource = req.params.resource;
	var identifier = req.params.id;
	
	if (identifier==null){
		res.send({'confirmation':'fail', 'message':'Missing resource identifier.'});
		return
	}
	
  	if (resource=='device'){
		var query = {_id: identifier};
		var options = {new: false};
		
		
		Device.findOneAndUpdate(query, req.body, options, function(err, device){
			if (err){
				res.json({'confirmation':'fail', 'message':err.message});
				return;
			}
			
			console.log('DEVICE UPDATE: '+JSON.stringify(req.body));
			var searchHistory = req.body.searchHistory;
			if (searchHistory == null){
				res.json({'confirmation':'success', 'device':device.summary()});
				return;
			}
			
			device['searchHistory'] = searchHistory;
			
			// EXTREMELY IMPORTANT: In Mongoose, 'mixed' object properties don't save automatically - you have to mark them as modified:
			device.markModified('searchHistory');  
			
			
			device.save(function (err, device){
				if (err){
					console.log('ERROR: '+err.message);
					res.json({'confirmation':'fail', 'message':err.message});
					return;
				}
				
				res.json({'confirmation':'success', 'device':device.summary()});
				return;
			});
		});
	}

	if (resource=='autosearch'){
		var query = {_id: identifier};
		var options = {new: true};		
		
		AutoSearch.findOneAndUpdate(query, req.body, options,function(err, autosearch){
			if (err){
				res.send({'confirmation':'fail', 'message':err.message});
				return;
			}
			
			res.json({'confirmation':'success', 'autosearch':autosearch.summary()});
		});
	}
});

module.exports = router;
