var express = require('express');
var cas = require('connect-cas');
var router = express.Router();
var user = require('./modules/user');
//var handleContent = require('./modules/handleContent.js');
router.get('/', cas.ssout('/protected'), cas.serviceValidate(), cas.authenticate(), function(req, res) {
    res.render('dashboard', {
        title: 'Dashboard | Letsbuild',
        editAppTile: true,
        user: user.getDetails(req)
    });
});
module.exports = router;
