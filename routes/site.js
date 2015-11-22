var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('site/home', {'title':'Home'});
});


router.get('/:page', function(req, res, next) {
	var page = req.params.page;

	if (page == 'iosapp'){ // redirect to itunes page
		res.redirect('https://itunes.apple.com/us/app/pubsavvy-swipe/id1045169328?mt=8');
		return;
	}


	res.render('site/'+page, {'title':page.toUpperCase()});
});

module.exports = router;
