# node-braph 
The NodeJS client for Braph. With this module you can create and save your back-end entities on an on-line braph, it's intended to be used with ES6. Take this as a database as a service empowered with a braph capabilities.

Install with:

    npm install braph

## Usage example

You need to create an account on [Braph](http://alpha.braph.com/), currently on experimental stage, then create a braph and get the credentials along with the id. After that, you will be able to create instances from your back-end project as follows:

__Braph.js__
```js 
var Braph  = require('braph').Braph;

module.exports.Braph = new Braph({
  id : 'braph_id',
  client_id : 'client_id',
  client_secret : 'client_secret',
  api_url : 'https://api.braph.com/alpha/v1'
});
```

__models/Post.js__
```js

var Instance    = require('braph').Instance;
var Braph       = require("./../Braph");

class Post extends Instance {

    constructor(data){
        super();
        this.title = data.title;
        this.content = data.content;
        this.date = data.date;
    }

}

// Required
Post.braph = Braph;

// Optional
Post.schema = {
    title : 'string',
    content : 'string',
    date :  'date'
}

module.exports = Post;

```

The properties that will be associated with this Instance are the ones that will be returned with the __Object.getOwnPropertyNames__ method such as ___title___ or ___date___ in the example. 

If you are used to work with getters as the property name using inner properties named as ____title___ or ____date___ then you have to implement the __getProperties()__ method else you will have objects with properties named as the inner ones.

```js
var Instance    = require('braph').Instance;
var Braph       = require("./../Braph");

class Post extends Instance {

    constructor() {
        super();
    }

    // Getters and setters.

    get name(){
        return this._name;
    }

    set name(value){
        this._name = value;
    }

    get date(){
        return this._date;
    }

    set date(value){
        this._date = value;
    }

    // getProperties() implementation

    getProperties() {
        return {
            name : this.name,
            date : this.date
        }
    }
}

// Required
Post.braph = Braph;

// Optional
Post.schema = {
    title : 'string',
    content : 'string',
    date :  'date'
}

module.exports = Post;

```

Now you are able to work with **instances** of this Post pre-configured **class** and save or query them on Braph as follows:

### Create instances

```js

var Post = require('./models/Post.js');

var post = new Post({
    title : 'hello world',
    content : 'again',
    date : new Date()
});

post.save(function(err){
    //...
});

```

### List instances

```js

var Post = require('./models/Post.js');

var page = 1;
var itemsPerPage = 10;

Post.list(page, itemsPerPage, function(err, posts){
    //...
});

```

### Read instances

```js

var Post = require('./models/Post.js');

var post_id = 25;

Post.read(post_id, function(err, post){
    //...
});

```

## Controllers and Middlewares

The NodeJS client for Braph provide you with the option to implement direct controllers and Braph scoped authentication to your API. It's really helpful when you want to avoid coding that controller layer that many times follows the same CRUD pattern.

To implement the **B_Auth_Token** you need to use a **Login with Braph** flow in your application where the **Authentication** middleware is required.

```js

var express = require('express');
var cors = require('cors');

var Braph = require('./../Braph');
var Post = require("./../models/Post"); 

const cors_options = {
	origin: new RegExp(/(project\.com)$/)
};

var v1 = express.Router();

module.exports = function (server) {

	server.use(cors(cors_options));

	server.options('*', cors(cors_options))

	v1.post('/auth/login',	Braph.Authentication.login);

	v1.post("/posts",       Braph.Middleware.B_Auth_Token, Post.Controller.create.bind(Post.Controller));

	v1.get("/posts",        Post.Controller.list.bind(Post.Controller));

	v1.get("/posts/:id",	Post.Controller.read.bind(Post.Controller));

	server.use('/v1', v1);

	return server;

}

```


NOTE : This module was created with the [npm-module-boilerplate](https://github.com/Travelport-Ukraine/npm-module-boilerplate).