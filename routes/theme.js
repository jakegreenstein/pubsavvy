var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('theme/home', {'title':'Home'});
});



router.get('/:page', function(req, res, next) {
	var page = req.params.page;
	res.send('theme/'+page);
});

module.exports = router;
