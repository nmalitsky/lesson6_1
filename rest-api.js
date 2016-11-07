const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:6565/lesson6'); // connect to users storage
var User = require('./db/models/user'); 


const routerAPIv1 = express.Router();

// middleware to use for all requests
app.use((req, res, next) => {
	console.log(req.url);
	next();
});

routerAPIv1.get('/', (req, res) => {
	res.status(200).json({ message: 'Welcome to REST API! Usage: /users, users/:user_id' });	
});

// on routes that end in /users
// ----------------------------------------------------
routerAPIv1.route('/users')

	// create a users (accessed at POST http://localhost:3000/api/users)
	.post((req, res) => {

        	let user = new User();
        	user.name = req.body.name;
		user.score = req.body.score;

		user.save(err => {
			if(err) {
				res.status(400).send(err);
			} else {
				res.status(200).json({ message: 'User created'});
			}
		});
	})

	// get all the users (accessed at GET http://localhost:3000/api/users?offset=1&limit=2&fields=id,name)
	.get((req, res, next) => {

		User.count({}, (err, count) => {
			if(err) {
				res.status(400).send(err);
			} else {

				// offset & limit
				let offset = parseInt(req.query.offset || 0); 
				let limit = parseInt(req.query.limit || count);
				let fields = (req.query.fields || '').split(',').join(' ');

			        User.find({}, fields, (err, users) => {
					if(err) {
						res.status(400).send(err);
					} else {
				            	res.status(200).json(users);
					}
			        }).skip(offset).limit(limit);
			}
		})

	})

	// delete all users (accessed at DELETE http://localhost:3000/api/users)
	.delete((req, res) => {

		User.remove({}, (err) => { // {} - remove all collection
			if(err) {
				res.status(400).send(err);
			} else {
		       		res.status(200).json({ message: 'All users are deleted' });
			}
		});
	});


// on routes that end in /users/:user_id
// ----------------------------------------------------
routerAPIv1.route('/users/:user_id')

	.get(function(req, res) {

        	User.findById(req.params.user_id, (err, user) => {
			if(err) {
				res.status(400).send(err);
			} else {
	            		res.status(200).json(user);
			}
        	});
    	})


	.put(function(req, res) {
		User.findById(req.params.user_id, (err, user) => {
			if(err) {
				res.status(400).send(err);
			} else {
				user.name = req.body.name;
				user.score = req.body.socre;

				user.save((err) => {
					if(err) {
						res.status(400).send(err);
					} else {
						res.status(200).json({ message: 'User updated' });
					}
				});
			}
	        });
	})

	.delete(function(req, res) {
		User.remove({_id: req.params.user_id}, (err) => {
			if(err) {
				res.status(400).send(err);
			} else {
		       		res.status(200).json({ message: 'User deleted' });
			}
		});
	});

app.use('/api/v1', routerAPIv1);

// middleware for handling all errors
// ATTENTION - must be AFTER ALL middlewares (app.use(...)) for exclude errors
app.use((err, req, res, next) => {
	res.status(err.status ? err.status : 500).end(err.message);
});

app.all('/*', (req, res) => {
	res.status(400).json({ message: 'Undefinded URL - use /api/v1/' });
});

app.listen(port);
console.log('Listening REST API on port ' + port);
