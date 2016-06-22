/**
 * Created by alex on 6/21/16.
 */
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
const https = require('https');

var querystring = require('querystring');
var url = 'mongodb://mac5.ixcglobal.com:27017/heartin-news';
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
        }
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

    var params = {user_id: 'AlexVinogradov4', count: 200, exclude_replies: true};
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            //console.log(tweets);
            // var tweet = tweets[2];
            var i = 0;

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


                }
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
