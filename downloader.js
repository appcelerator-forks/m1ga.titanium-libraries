exports.create = function(opt) {
    return new Download(opt);
};

function Download(opt) {

    var xhr = Ti.Network.createHTTPClient();
    // switch this off so it will work for all ssl sites
    xhr.validatesSecureCertificate = false;

    var folder = opt.folder || "";
    var success = opt.success || null;
    var error = opt.error || null;
    var progress = opt.progress || null;
    var timeout = opt.timeout || 5000;
    var url = opt.url || "";
    var overwrite = opt.overwrite || false;
    var dir = Ti.Filesystem.applicationDataDirectory;
    var download = opt.download || true;
    var pwd = opt.password || null;
    var username = opt.username || null;
    var customname = opt.filename || null;
    var isDebug = opt.debug || false;
    var parameter = opt.parameter;
    var random = (opt.noRandom) ? "" : "?" + Math.floor(Math.random() * 1000); // add a random value at the end to remove caching issues

    if (OS_ANDROID) {
        dir = Ti.Filesystem.externalStorageDirectory;
    }

    // check if the folder already exists or create it
    if (download && !Ti.Filesystem.getFile(dir, folder).exists()) {
        Ti.Filesystem.getFile(dir, folder).createDirectory();
    }

    this.get = function() {

        var fname = url.substring(url.lastIndexOf('/') + 1);

        if (customname !== null) {
            fname = customname;
        } else {
            fname = fname.replace(/\?/g, '');
            fname = fname.replace(/=/g, '');
        }
        var f = Ti.Filesystem.getFile(dir, folder, fname);

        if (Ti.Network.online) {
            // is online
            if (!download || (download && overwrite) || (!f.exists() && fname != "null")) {
                // start download

                if (isDebug) Ti.API.info("get: " + url);

                xhr.ondatastream = function(e) {
                    if (xhr && progress) {
                        if (xhr.getResponseHeader('Content-Length')) {
                            var full = xhr.getResponseHeader('Content-Length') / 1024 / 1024;
                            progress({
                                progress: e.progress
                            });
                            full = null;
                        }
                    }
                };

                xhr.onload = function() {
                    if (this.readyState == 4) {
                        var content = null;
                        var f = Ti.Filesystem.getFile(dir, folder, fname);
                        if (isDebug) Ti.API.info("done loading: " + f.nativePath);
                        if (download) {
                            // save file

                            if (isDebug) Ti.API.info("saved as: " + f.nativePath);
                            f.remoteBackup = false;

                        } else {
                            // give back the content of the file
                            content = this.responseData;
                        }

                        // call success function
                        if (success) success({
                            url: url,
                            file: fname,
                            content: content,
                            parameter: parameter
                        });

                        // clean up

                        content = null;
                        f = null;
                        cleanUp();

                    } else {
                        // call error function
                        if (error) error({
                            url: url,
                            file: fname,
                            parameter: parameter
                        });

                        // clean up
                        cleanUp();
                        return false;
                    }
                };
                xhr.onerror = function(e) {
                    if (isDebug) Ti.API.info("download error " + JSON.stringify(e));
                    if (error) error({
                        url: url,
                        file: fname,
                        parameter: parameter
                    });
                    cleanUp();
                    return false;
                };

                xhr.timeout = timeout;

                xhr.open('GET', url + random);
                
                if (download) {
                    // save file
                    if (isDebug) Ti.API.info("saving as: " + f.path);
                    xhr.file = f.path;
                }

                
                if (pwd !== "") {
                    // set password
                    var authstr = 'Basic ' + Titanium.Utils.base64encode(username + ":" + pwd);
                    authstr = authstr.replace(/(\r\n|\n|\r)/gm, "");
                    xhr.setRequestHeader('Authorization', authstr);
                    authstr = null;
                }
                xhr.send();

            } 
            else {
                // already there
                if (isDebug) Ti.API.info("skipping " + url);
                Ti.API.info("skipping " + fname);
                if (success) success({
                    url: url,
                    file: fname,
                    parameter: parameter
                });
                cleanUp();
            }
        } else {
            // offline
            if (isDebug) Ti.API.info("download offline");
            if (error) {
                if (isDebug) Ti.API.info("call error");
                error({
                    url: url,
                    file: fname,
                    parameter: parameter
                });
            }
            cleanUp();
        }
    };

    function cleanUp() {
        xhr = null;
        fname = null;
        error = null;
        url = null;
        success = null;
        progress = null;
        timeout = null;
        folder = null;
        overwrite = null;
        dir = null;
        download = null;
        pwd = null;
        username = null;
    }

    this.abort = function() {
        if (xhr) {
            xhr.abort();
        }
        cleanUp();

    };
}
