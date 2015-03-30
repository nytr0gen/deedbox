var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.cookie('ridichi', 'albe');
    res.render('index', { title: 'Express' + req.success + JSON.stringify(req.cookies) });
});

module.exports = router;
