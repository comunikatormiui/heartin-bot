var Linkedin = require('node-linkedin')('h3i1eddlw1jx', 'qa7Mao7H9NOOoeCm', 'http://localhost:9090/auth/linkedin/callback');
var scope = ['r_basicprofile', 'r_fullprofile', 'r_emailaddress', 'r_network', 'r_contactinfo', 'rw_nus', 'rw_groups', 'w_messages'];
Linkedin.auth.authorize(res, scope, 'state');
