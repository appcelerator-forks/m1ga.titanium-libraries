## downloader ##

download files to save them or just read them (e.g. json).
Usage:

require("/download").create({
	url:"http//:...",download:false
}).get();


### parameters ###
- url: string
- download: boolean
- overwrite: boolean
- folder: string
- success: callback function
- error: callback function
- password: string (htaccess)
- username: string (htaccess)
- timeout: int
