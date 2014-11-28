# Titanium libraries

Some useful libraries that will be needed in almost every app and you don't want to write all the time.

## How to use them

create a lib folder in your projectname/app/ folder and place the js files there.


## Changelog
- api.js: fix for GET; added noParameter parameter to make clean calls without standard parameters
- push.js: WIP

- api.js: cacheID and cacheTime: API will pause [cacheTime] seconds. cacheID should be a string to identify the call
- geo.js: don't call callback when coordinates are the same as before

## Libraries

___

### api.js

make a call to a web-API and receive the feedback
Usage:
~~~
require("/api").create({
	url: SERVER + "api.php",
	type: "POST",
	parameter: {
		service: "login",
		email: "test@test.com",
		password: Ti.Utils.sha1("password")
	},
	success: onSuccess,
	error: onErrorLogin,
	cacheID: "apiCall",
	cacheTime: 3
});
~~~

#### parameters
- url
- type: POST or GET (default)
- paramater: array
- success: callback function
- error: callback function
- cacheID: ID to identify this call
- cacheTime: during cacheTime the call won't be executed (use this to stop calling the url to often)
- noParameter: do not add any parameters to the call

___

### downloader.js

download files to save them or just read them (e.g. json).
Usage:
~~~
require("/download").create({
	url:"http//:...",download:false
}).get();
~~~

#### parameters
- url: string
- download: boolean
- overwrite: boolean
- folder: string
- success: callback function
- error: callback function
- password: string (htaccess)
- username: string (htaccess)
- timeout: int
- customname: string - new filename for the download

___

### geo.js

library to add geo services to Android and iOs
~~~
var geo = require("geo").create({
	updatePosition:callback
});
geo.init();
geo.getDistance({lon:5,lat:5});
function callback(e){
	Ti.App.Properties.getDouble("lat");
	Ti.App.Properties.getDouble("lon");
}
~~~

Position will be stored in:
~~~
Ti.App.Properties.getDouble("lat");
Ti.App.Properties.getDouble("lon");
~~~

#### parameters
- updatePosition: callback function
