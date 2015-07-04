var express = require('express');
var request = require('request');
var xmlToJson = require('xml2js');
var Profile = require('../models/Profile');
var Device = require('../models/Device');
var AutoSearch = require('../models/AutoSearch');
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
				 	
			    console.log('results');
				
				if (completion != null)
					completion(result);
				
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
		else
			summary['abstract'] = articleSummary['Abstract'][0]['AbstractText'][0]['_'];
	
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
		var baseUrl = 'http://www.ncbi.nlm.nih.gov/entrez/eutils/';
		var url = baseUrl+'esearch.fcgi?db=pubmed&term='+searchTerm+'&usehistory=y&retmax=100';
		var results = urlRequest(url, function(results){
			var eSearchResult = results.eSearchResult;
			var count = eSearchResult['Count'][0];
			var webEnv = eSearchResult.WebEnv;
			
			var offset = (req.query.offset == null)? '0' : req.query.offset;
			var limit = (req.query.limit == null)? '100' : req.query.limit;
			var clean = (req.query.clean == null)? 'yes' : req.query.clean;
			
			var nextReq = baseUrl+'efetch.fcgi?db=Pubmed&retstart='+offset+'&retmax='+limit+'&usehistory=y&query_key=1&WebEnv='+webEnv+'&reldate=36500&retmode=xml';
			urlRequest(nextReq, function(results){
				res.setHeader('content-type', 'application/json');
				
				if (clean != 'yes'){
					var json = JSON.stringify({'confirmation':'success', 'count':count, 'results':results}, null, 2); // this makes the json 'pretty' by indenting it
					res.send(json);
					return;
				}
				
				var PubmedArticleSet = results['PubmedArticleSet'];
				var articles = PubmedArticleSet['PubmedArticle'];
				var list = cleanUpResults(articles);
				
				if (req.query.device == null) {
					var json = JSON.stringify({'confirmation':'success', 'count':count, 'results':list}, null, 2); // this makes the json 'pretty' by indenting it
					res.send(json);
					return;
				}
				
				Device.findById(req.query.device, function(err, device){
					if (err){
						res.json({'confirmation':'fail','message':"Device "+req.query.device+" not found"});
						return;
					}
					
					var searchHistory = device.searchHistory;
					var searchObj = searchHistory.toObject();
					if (searchObj.hasOwnProperty(searchTerm)){
						var termCount = searchObj[searchTerm];
						searchObj[searchTerm] = termCount+1;
					} 
					else{
						searchObj[searchTerm] = 1;
					}
					
					device[searchHistory] = searchObj;
					
					// EXTREMELY IMPORTANT: In Mongoose, 'mixed' object properties don't save automatically - you have to mark them as modified:
					device.markModified('searchHistory');  
					
					
					
					device.save(function (err, device){
						if (err)
							console.log('ERROR: '+err.message);
						else
							console.log('DEVICE SAVED: '+JSON.stringify(device.summary()));
						
						// this makes the json 'pretty' by indenting it:
						var json = JSON.stringify({'confirmation':'success', 'count':count, 'results':list}, null, 2);
						res.send(json);
						return;
						
					});
					
				});
				
			});
		});
		
		return;
	}


	if (resource == 'related') {
  		if(req.query.pmid == null){
  			res.json({'confirmation':'fail', 'message':'Missing pmid parameter.'})
  			return;
  		}
		
		var url = 'http://www.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&db=pubmed&id='+req.query.pmid;
		var results = urlRequest(url, function(results){
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
			var results = urlRequest(nextUrl, function(results){
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
				var list = cleanUpResults(articles);
				
				// this makes the json 'pretty' by indenting it
				var json = JSON.stringify({'confirmation':'success', 'count':count,  'results':list}, null, 2); 
				res.send(json);
				return;
			
			});
		});		
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
			res.json({'confirmation':'success', 'profile':profile.summary()});
		});
		return;
	}
	
	
  	if (resource=='device'){

  		//TEMPORARY WAY TO POPULATE searchHistory with a json object
  		// var deviceJson = req.body;
  		// deviceJson['searchHistory'] = {'default':0};
  		//FIND BETTER SOLUTION LATER

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
		var options = {new: true};
		
		
		Device.findOneAndUpdate(query, req.body, options, function(err, device){
			if (err){
				res.send({'confirmation':'fail', 'message':err.message});
				return;
			}
			
			res.json({'confirmation':'success', 'device':device.summary()});
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
