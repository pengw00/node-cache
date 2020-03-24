"use strict";
const express = require("express");  
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 4000;

//need to run redis-server in local
// app.get("/spacex/launches", (req, res) => {  
//   fetch("https://api.spacexdata.com/v3/launches/latest")
//     .then(res => res.json())
//     .then(json => { res.status(200).send(json) })
//     .catch(error => {
//       console.error(error);
//       res.status(400).send(error);
//     });
// });
// app.listen(PORT, () => console.log(`Server up and running on ${PORT}`));

//implementing a middleware to intercept the cache

// Now, add middleware to check if the key exists in the cache, if not then get it from the third party API and update the cache.

const PORT_REDIS = process.env.PORT || 6379;
const app = express();
const redisClient = redis.createClient(PORT_REDIS);
const set = (key, value) => {
   redisClient.set(key, JSON.stringify(value));
}

//middleware here, but how to do in java springboot? auto config by apache?
const get = (req, res, next) => {
	let key = req.route.path;
    redisClient.get(key, (error, data) => {
      if (error) res.status(400).send(err);
      if (data !== null) res.status(200).send(JSON.parse(data));
      else next();
 	});
}
app.get("/spacex/launches", get, (req, res) => {
  fetch("https://api.spacexdata.com/v3/launches/latest")
    .then(res => res.json())
    .then(json => {
    	set(req.route.path, json);
    	res.status(200).send(json);
    })
    .catch(error => {
      console.error(error);
      res.status(400).send(error);
    });
});
app.listen(PORT, () => console.log(`Server up and running on ${PORT}`));


// Lastly, need to update lastest 3th party api data, using 

// One very obvious pitfall in this implementation is that once we add it to the cache, 
// we will never fetch the updated value from the third-party API. 
// This probably isn’t the expected behavior. 
// One way to counter this is to use setex which takes an expiry argument.
//  It essentially runs two atomic operations. SET and EXPIRE. 
//  After the set expiry period, we fetch the data again from the third party API and update the cache.
