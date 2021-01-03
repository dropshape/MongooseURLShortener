### MongooseURLShortener

Please Share on Twitter if you like __MongooseURLShortener__

<a href="https://twitter.com/intent/tweet?hashtags=MongooseURLShortener&amp;&amp;text=Check%20out%20this%20repo%20on%20github&amp;tw_p=tweetbutton&amp;url=https%3A%2F%2Fgithub.com%2Fdropshape&amp;via=dropshape" style="float:right">
<img src="https://raw.github.com/dropshape/MongooseURLShortener/master/twittershare.png">
</a>

A simple URL Shortening library for NodeJS using [Promises/A+](http://promises-aplus.github.io/promises-spec/) results.

#### Installation

```sh
    npm install mongoose-url-shortener --save
```

#### API

```js    
    // Setup Mongoose
    var connection = require('mongoose').connect('mongodb:testing');
    // Initialize Shortener
    var urlShotener = MongooseURLShortener(connection, options);
```

##### Options

```js
    {
        seed:12345,
        schema: {
            customSchemaValue:Number,
            customSchemaObj:{}
        }
    }
```

**Seed**
Optional value to use for generating short url's. You must always use the same seed otherwise you will not be able to resolve short urls' back to their original url.

**Schema**
Optional schema properties for the Mongoose object. You can then pass the extra values you define here to be saved along with the URL when shortening or resolving

##### Shorten
Shorten will either create a new short url in your database or resolve to a previously shortened URL.

```js
    url = 'http://www.google.com';
    data = { 'any data you want to record with the short url' : true }
    var promise = urlShortener.shorten(url, data);
    promise.then(function(url){
        console.log(url.hash);
        //aGasjn1Ho
    }).fail(function(err){
        console.error('Error creating short url', err);
    });
```

##### Resolve
Resolve will return the original URL before shortening if one is available in the database.

```js
    hash = 'aGasjn1Ho';
    data = {ip:'127.0.0.1'};
    var result = urlShotener.resolve(hash, data);
    result.then(function(url){
    console.log(url );
    // { 
    //    type: 'MongooseURLShortener', 
    //    url: 'http://www.google.com', 
    //    hash:'aGasjn1Ho',
    //    hits:{
    //        {ip:'127.0.0.1},
    //        {ip:'127.0.0.1},
    //    },
    //    totalHits: 2
    //}
    }).fail(function(err){});
```

**data** is an optional object you would like to be saved with each resolution of a URL and can be used for such things
as analytics tracking.

Check out [NodeTinyUrl](https://github.com/dropshape/NodeTinyUrl) for a working implementation

Please Share on Twitter if you like __MongooseURLShortener__

<a href="https://twitter.com/intent/tweet?hashtags=MongooseURLShortener&amp;&amp;text=Check%20out%20this%20repo%20on%20github&amp;tw_p=tweetbutton&amp;url=https%3A%2F%2Fgithub.com%2Fdropshape&amp;via=dropshape" style="float:right">
<img src="https://raw.github.com/dropshape/MongooseURLShortener/master/twittershare.png">
</a>
