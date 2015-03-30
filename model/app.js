
// post.new('unt de arahide');
// // post.update('54cceb1a609720', 'unt de lemn');
// post.getMany()
//     .then(function(posts) {
//         for (var i = 0; i < posts.length; i++) {
//             console.log(posts[i].id);
//             post.get(posts[i].id)
//                 .then(console.log, console.log.bind(this, 'error:'));
//         };
//     });

// post.get('54c3d956523626', function(err, data){
//     console.dir(data);
// });

// post.get('54c3d956523626')
//     .then(function(data) {
//         console.log(data);
//     }, function(err) {
//         console.log('err' + err);
//     });

var user = require('./').user();
// user.register('george', 'purcel')
//     .then(console.log, console.log.bind(this, 'error:'));

user.login('george', 'vitel')
    .then(console.log, console.log.bind(this, 'error:'));

// user._updateKeychain('george', 'vitel', 'purcel');

// user.getLogged({
//     username: 'george',
//     session: '4c3b6c977e370cf46bdebdd8f94455033ecc0b24',
//     keychain: 'k1F1jvC4ux+cn4MwcEfuT+NB4nqd55C6LiBcCc3Paw9cP3nNYmop4tkP08v5IGlZJ3Rn40bxZ9RfdIfn9HRqcA=='
// }).then(function(cookies) {
//     var post = require('./').post(cookies.username, cookies.keychain);
//     // post.new('unt de arahide');
//     // post.update('54cceb1a609720', 'unt de lemn');
//     post.getMany()
//         .then(function(posts) {
//             for (var i = 0; i < posts.length; i++) {
//                 console.log(posts[i].id);
//                 post.get(posts[i].id)
//                     .then(console.log, console.log.bind(this, 'error:'));
//             };
//         });
// }, console.log.bind(this, 'error:'))

// user._getKeychain('george', 'purcel')
//     .then(function(key) {
//         console.log(key);
//     })