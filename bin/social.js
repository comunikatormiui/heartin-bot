/**
 * Created by alex on 6/21/16.
 */

// var passport = require('passport');
// var LinkedInStrategy = require('passport-linkedin');
//
//
// var express = require('express')
// var app = express()
// app.get('/auth/linkedin', passport.authenticate('linkedin'));
//
// app.get('/auth/linkedin/callback',
//     passport.authenticate('linkedin', { failureRedirect: '/login' }),
//     function(req, res) {
//         // Successful authentication
//         res.json(req.user);
//     });
// app.listen(3000, function () {
//     console.log('Example app listening on port 3000!');
//     passport.use(new LinkedInStrategy({
//             consumerKey: 'h3i1eddlw1jx',
//             consumerSecret: 'qa7Mao7H9NOOoeCm',
//             callbackURL: 'http://127.0.0.1:3000/auth/linkedin/callback'
//         },
//         // linkedin sends back the tokens and progile info
//         function(token, tokenSecret, profile, done) {
//
//             var searchQuery = {
//                 name: profile.displayName
//             };
//
//             var updates = {
//                 name: profile.displayName,
//                 someID: profile.id
//             };
//
//             var options = {
//                 upsert: true
//             };
//
//             // update the user if s/he exists or add a new user
//             User.findOneAndUpdate(searchQuery, updates, options, function(err, user) {
//                 if(err) {
//                     return done(err);
//                 } else {
//                     return done(null, user);
//                 }
//             });
//         }
//
//     ));
// });
//
//
// return;
// var Mailchimp = require('mailchimp-api-v3')
//
// var mailchimp = new Mailchimp('9b979446def71d4d072fd25851dbdb60-us9');
// (function() {
//     var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
//
//     var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
//
//     Date.prototype.getMonthName = function() {
//         return months[ this.getMonth() ];
//     };
//     Date.prototype.getDayName = function() {
//         return days[ this.getDay() ];
//     };
// })();


//
//
// var passport = require('passport');
// //
// var OAuth2Strategy = require('passport-linkedin-oauth2').OAuth2Strategy;
// // passport.use(new LinkedInStrategy({
// //     clientID: 'h3i1eddlw1jx',
// //     clientSecret: 'qa7Mao7H9NOOoeCm',
// //     callbackURL: "http://127.0.0.1:9091/auth/linkedin/callback",
// //     scope: ['r_emailaddress', 'r_basicprofile','w_share'],
// // }, function(accessToken, refreshToken, profile, done) {
// //     // asynchronous verification, for effect...
// //     console.log("done 1");
// //
// //
// // }));
// const https = require('https');


var Linkedin = require('node-linkedin')('h3i1eddlw1jx', 'qa7Mao7H9NOOoeCm', 'http://127.0.0.1:3000/auth/linkedin/callback');

var express = require('express')
var app = express()
var htmlparser = require("htmlparser2");


app.get('/oauth/linkedin', function(req, res) {
    console.log(res);

    // This will ask for permisssions etc and redirect to callback url.
    Linkedin.auth.authorize(res, scope);
});

app.get('/oauth/linkedin/callback', function(req, res) {
    Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function(err, results) {
        if ( err )
            return console.error(err);

        /**
         * Results have something like:
         * {"expires_in":5184000,"access_token":". . . ."}
         */

        console.log(results);
        return res.redirect('/');
    });
});
// app.get('/linkedinLogin/linkedinCallbackUrlLogin', passport.authenticate('linkedin', {
//     session: false,
//     successRedirect:'/linkedinLogin/success',
//     failureRedirect:'/linkedinLogin/fail'
// }));

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
    var scope = ['w_share'];
    var auth_url = Linkedin.auth.authorize(scope);

    // var jsdom = require("jsdom");
    //
    // jsdom.env(
    //     auth_url,
    //     ["http://code.jquery.com/jquery.js"],
    //     function (err, window) {
    //         console.log("there have been", window.$("a").length - 4, " a type records");
    //     }
    // );

    var request = require('request');
    request({
        uri: auth_url,
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function(error, response, body) {

        // console.log(body);

        var jsdom = require("jsdom");

        var document = jsdom.jsdom(body);

        var bodyEl = document.body; // implicitly created
        var scope_id = document.getElementById("scope_id-oauth2SAuthorizeForm");
        // var textNode = pEl.firstChild;
        // var imgEl = document.querySelector("img");
        // console.log(jsdom.nodeLocation(bodyEl));   // null; it's not in the source
        console.log(scope_id);      // { start: 0, end: 39, startTag: ..., endTag: ... }
        // console.log(jsdom.nodeLocation(textNode)); // { start: 3, end: 13 }
        // console.log(jsdom.nodeLocation(imgEl));    // { start: 13, end: 32 }
        //
        // var parser = new htmlparser.Parser({
        //     onopentag: function(name, attribs){
        //         // console.log("name -->" + attribs.name + ' attribs.id:' + attribs.id );
        //
        //         if(name === "input"){
        //             console.log("name -->" + attribs.name + ' attribs.id:' + attribs.id );
        //
        //             // console.log("attribs " + attribs);
        //         }
        //     },
        //     ontext: function(text){
        //         // console.log("-->", text);
        //     }
        //     // ,
        //     // onclosetag: function(tagname){
        //     //     if(tagname === "script"){
        //     //         console.log("That's it?!");
        //     //     }
        //     // }
        // }, {decodeEntities: true});
        // parser.write(body);
        // parser.end();

        var headers = {
            'User-Agent':       'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
            'Accept':       'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding':       'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Origin':       'https://www.linkedin.com',
            'Referer':       'https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=h3i1eddlw1jx&state=u_h4DMVXHbAFTxYq&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Fauth%2Flinkedin%2Fcallback&scope=w_share',

        }

// Configure the request
        var formData = {
            isJsEnabled: true,
            session_key: 'alex@callsfreecalls.com',
            session_password: 'alex1vinogradov2',
            authorize: 'Allow access',
            oauth_token: 'na',
            appId: '',
            client_id: 'h3i1eddlw1jx',
            scope: 'w_share',
            state: 'u_h4DMVXHbAFTxYq',
            redirect_uri: 'http://127.0.0.1:3000/auth/linkedin/callback',
            scope_id: 18033,
            authorized: true,
            csrfToken: 'ajax:0494390882539560289',
            sourceAlias: '0_9DsHd_bZgogqUxUum9_VlTBWJMUCeow0cdGxvyKqdV8',
            client_ts: new Date().valueOf(),
            client_r: ':881332014:251639022:850218108',
            client_output: 0,
            client_n: '881332014:251639022:850218108',
            client_v: '1.0.1'
        }

        var options = {
            url: 'https://www.linkedin.com/uas/oauth2/authorizedialog/submit',
            method: 'POST',
            headers: headers,
            form: formData
        }

// Start the request
//         request(options, function (error, response, body) {
//             if (!error && response.statusCode == 200) {
//                 // Print out the response body
//                 console.log(body)
//             }
//         })

    });

    // request(auth_url, function (error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //         // console.log(body) // Print the google web page.
    //     }
    // })
    // passport.use('linkedin', new OAuth2Strategy({
    //         authorizationURL: 'https://www.linkedin.com/uas/oauth2/authorization',
    //         tokenURL: 'https://www.linkedin.com/uas/oauth2/accessToken',
    //         clientID: 'alex@callsfreecalls.com',
    //         clientSecret: 'alex1vinogradov2',
    //         callbackURL: '/linkedinLogin/linkedinCallbackUrlLogin',
    //         passReqToCallback: true
    //     },
    //     function(req,accessToken, refreshToken, profile, done) {
    //         console.log('authenticated');
    //         console.log(accessToken);
    //         req.session.code = accessToken;
    //         process.nextTick(function () {
    //             // retrieve your user here
    //             getOrCreateUser(profile, function(err, user){
    //                 if(err) return done(err);
    //                 done(null, user);
    //             })
    //
    //         });
    //     }));

})




return;

var Twitter = require('twitter');
var client = new Twitter({
    consumer_key: 'iQzidPV6gp9dkfVnZzjPNNret',
    consumer_secret: 'nfcoJeeQNcvEwi580tYfJAIRhwomF1pgKtx7yk73cXiocWuYg1',
    access_token_key: '2327047891-q9yRKoPkBNiMLUor6h7fY9SWjk9E4cPuh2Nb9h7',
    access_token_secret: 'dmtN3pqfTdssPSriHODwGtYqH85J5qZFCv1XMyk13jjxC'
});
// http://stackoverflow.com/questions/17197970/facebook-permanent-page-access-token generation
//
// var accessToken='EAANBZCY6ZAVmIBAODS735ImnWuRfR5FMah4mhMoRQFUoav431MSBLakuVYbmaG8Vr6JdZB9h304WJVXqumzUTPUKJ6TiZAxpdHyMMJLt6rXeQFIb4gtYq0UVaukfK0lsbsk0gZCjtMkirbSaG2DRMUdJfZAo6IN0ZC8t06b59ppOAZDZD';
var accessToken='EAANBZCY6ZAVmIBAJ3ltZCAaqfvnvUiZAbYuYmVZARwW1b6USZAEXiVbI6lbWoXPPB71QnayVZA9DgWpTbT8x7xow00C2eQhaD85pPNZCkqAuu4C9mZCjMwpMOO4CewAmjmGQjLPrKeUFHDnQNqhEUtWThHAUOlkpfTzeIdyZALEnXSRgZDZD';


//&expires=5184000

var querystring = require('querystring');
var url = 'mongodb://news:Manual@localhost:27017/heartin-news?authSource=heartin';
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

MongoClient.connect(url, function(err, db) {
    dbMain = db;

    db.collection('tweets').createIndex(
        {"text": 1},
        {unique: true},
        function (err, results) {
            assert.equal(err, null);
            console.log(results);
        }
    );

    assert.equal(null, err);
    console.log("Connected correctly to server.");

    function postTweetToFB(tweet, callback) {
        var parameters = {};
        var text = tweet.text;
        var urls = tweet.entities.urls;
        var user_mentions = tweet.entities.user_mentions;

        if (urls.length > 0) {
            var urlForPost = urls[0].url;
            parameters.link = urlForPost;
            text = text.replace(urlForPost, '');
            if (user_mentions.length > 0) {
                user_mentions.forEach(function (user_mention) {
                    var name = '@' + user_mention.screen_name;
                    text = text.replace(name, '');
                });
            }

            parameters.message = text;

            var post_options = {
                host: 'graph.facebook.com',
                port: '443',
                path: '/v2.6/healthcareNewsService/feed?access_token=' + accessToken,
                method: 'POST'
            };
            var post_data = querystring.stringify(parameters);
            var dataPost = '';

            // Set up the request
            var post_req = https.request(post_options, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    dataPost += chunk;
                });
                res.on('error', function (error) {
                    console.error(error);
                });
                res.on('end', function () {
                    var answer = JSON.parse(dataPost);
                    console.log('post answer: ' + answer);
                    callback();
                });
            });

            post_req.write(post_data);
            post_req.end();
        }
    }

    var params = {user_id: 'AlexVinogradov4', count: 200, exclude_replies: true};
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            //console.log(tweets);
            // var tweet = tweets[2];
            // var i = 0;
            // var list_id = '6509eb90d2';
            // var now = new Date();

            var day = now.getDayName();
            var month = now.getMonthName();
            var title = "healthcare news for " + day + " of the " + month;
/*
            mailchimp.post('/campaigns', {
                    type : 'regular',
                    recipients : {
                        list_id : list_id
                    },
                    settings : {
                        subject_line : title,
                        title : title,
                        from_name : "healthcare news",
                        reply_to : "info@heartin.net"
                    }
                })
                .then(function(results) {
                    var campaign_id = results.id;
                    console.log(campaign_id);
                    mailchimp.put('/campaigns/' + campaign_id + '/content', {
                            html :
                            '<p>Dear subscriber. </p>' +
                            '<p>We are update news on our <a href="https://www.facebook.com/healthcareNewsService/">page </a></p>' +
                            '<p>please take visit there</p>'
                        })
                        .then(function(results) {
                            console.log(results);
                            mailchimp.post('/campaigns/' + campaign_id + '/actions/send', {
                                })
                                .then(function(results) {
                                    console.log(results);
                                })
                                .catch(function (err) {
                                    console.log(err);
                                });
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                })
                .catch(function (err) {
                    console.log(err);
                });*/


            (function loop() {
                if (i < tweets.length) {
                    console.log('post tweet' + i);
                    var tweet = tweets[i];

                    dbMain.collection('tweets').find({'text': tweet.text}).toArray(function(err, items) {
                        if (err) {
                            console.error(err);
                            i++;
                            loop();
                            return;
                        }
                        if (items.length == 0) {
                            // TODO reconfigure
                            return;
                            postTweetToFB(tweet, function () {
                                db.collection('tweets').insertOne(tweet, function(err, result) {
                                    if (err)
                                        console.error(err);
                                    else console.log("Inserted a document into the collection tweets.");
                                });
                                i++;
                                loop();
                            });
                        } else {
                            console.log("Already a document into the collection tweets.");
                            i++;
                            loop();
                        }
                    });


                } else process.exit(0);

            }());
        }
    });


});









// client.stream('statuses/filter', {}, function(stream) {
//     stream.on('data', function(tweet) {
//         console.log(tweet.text);
//     });
//
//     stream.on('error', function(error) {
//         throw error;
//     });
// });
