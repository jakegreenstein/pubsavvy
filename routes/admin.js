var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:page', function(req, res, next) {
	var page = req.params.page;
	res.render('admin/'+page, {'title':page.toUpperCase()});
});

module.exports = router;
