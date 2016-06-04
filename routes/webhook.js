/**
 * Created by alex on 6/4/16.
 */
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/webhook', function(req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;