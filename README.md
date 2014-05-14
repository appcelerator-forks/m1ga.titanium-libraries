# Titanium libraries #

Some useful libraries that will be needed in almost every app and you don't want to write all the time.

## How to use them ##

create a lib folder in your projectname/app/ folder and place the js files there.

## Libraries ##

### downloader ###

download files to save them or just read them (e.g. json).
Usage:
~~~
require("/download").create({
	url:"http//:...",download:false
}).get();
~~~

#### parameters ####
- url: string
- download: boolean
- overwrite: boolean
- folder: string
- success: callback function
- error: callback function
- password: string (htaccess)
- username: string (htaccess)
- timeout: int

### geo ###

library to add geo services to android and ios
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

#### parameters ####
- updatePosition: callback function
