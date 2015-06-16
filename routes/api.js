var express = require('express');
var request = require('request');
var xmlToJson = require('xml2js');
var Profile = require('../models/Profile');
var Device = require('../models/Device');
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
	if (resource=='profile'){
		Profile.find(req.query, function(err, profiles) {
			if (err){
				res.json({'confirmation':'fail','message':err.message});
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
	
	
	if (resource=='device'){
		Device.find(null, function(err, devices){
			if (err){
				res.json({'confirmation':'fail','message':err.message});
				return next(err);
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
	
	
	
	if (resource == 'search'){
		console.log('SEARCH: '+JSON.stringify(req.query));
		
		var baseUrl = 'http://www.ncbi.nlm.nih.gov/entrez/eutils/';
		var url = baseUrl+'esearch.fcgi?db=pubmed&term='+req.query.term+'&usehistory=y&retmax=100';
		var results = urlRequest(url, function(results){
			var eSearchResult = results.eSearchResult;
			var webEnv = eSearchResult.WebEnv;
			
			var offset = req.query.offset;
			if (offset==null)
				offset = '0';
			
			var nextReq = baseUrl+'efetch.fcgi?db=Pubmed&retstart='+offset+'&retmax=100&usehistory=y&query_key=1&WebEnv='+webEnv+'&reldate=36500&retmode=xml';
			urlRequest(nextReq, function(results){
				res.setHeader('content-type', 'application/json');
				
				var list = new Array();
				var PubmedArticleSet = results['PubmedArticleSet'];
				var articles = PubmedArticleSet['PubmedArticle'];
				
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

					var dateRevised = meta['DateRevised'][0]; 
					summary['dateRevised'] = months[dateRevised['Month'][0]-1]+' '+dateRevised['Day'][0]+' '+dateRevised['Year'][0];
					
					var articleSummary = meta['Article'][0]; 
					
					var journal = articleSummary['Journal'][0]; 
					summary['journal'] = {'title':journal['Title'][0], 'iso':journal['ISOAbbreviation'][0], 'issn':journal['ISSN'][0]['_']};
					
					summary['title'] = articleSummary['ArticleTitle'][0];
					
					if (articleSummary['Abstract'] == null) // not always there
						summary['abstract'] = 'null';
					else
						summary['abstract'] = articleSummary['Abstract'][0]['AbstractText'][0]['_'];
					
					var authors = new Array();
					var authorList = articleSummary['AuthorList'][0]['Author'];
					for (var j=0; j<authorList.length; j++){
						var author = authorList[j];
						
						console.log(JSON.stringify(author));
						
						var authorInfo = {};
						if (author['LastName'] != null)
							authorInfo['lastName'] = author['LastName'][0];

						if (author['ForeName'] != null)
							authorInfo['firstName'] = author['ForeName'][0];

						if (author['AffiliationInfo'] != null)
							authorInfo['affiliation'] = author['AffiliationInfo'][0]['Affiliation'][0];
							
						
						authors.push(authorInfo);
					}
					
					summary['authors'] = authors;
					
					if (articleSummary['Language'] != null) // not always there
						summary['language'] = articleSummary['Language'][0];
					
					list.push(summary);
					
					
				}
				
				
				var json = JSON.stringify({'confirmation':'success','results':list}, null, 2); // this makes the json 'pretty' by indenting it
				res.send(json);
				return;
			});
		});
		
		return;
	}
	
	
	
});

router.get('/:resource/:id', function(req, res, next) {

	var resource = req.params.resource;
	var identifier = req.params.id;

  	if (resource=='profile'){
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
	if (resource == 'profile'){
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
