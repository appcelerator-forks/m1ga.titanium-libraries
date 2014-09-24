exports.create = function(opt) {
    return new API(opt);
};

function API(opt) {

    var url = opt.url;
    var type = opt.type||"GET"; // type of the request (POST or GET)
    var success = (opt.success) ? opt.success : null;   // success callback function
    var error = (opt.error) ? opt.error : null; // error callback function
    var isDebug = opt.debug || false;   // display debug output
    var cacheID = "api_"+opt.cacheID || "lastApi"+url; // string used to store the cache time
    var parameter = {};
    var cacheTime = opt.cacheTime || 0; // default 3 seconds between two checks
    for (var obj in opt.parameter) {
        parameter[obj] = (obj != "media") ? String(opt.parameter[obj]) : opt.parameter[obj];
    }
    parameter["udid"] = String(Ti.Platform.id);
    parameter["version"] = String(Ti.App.version);
    parameter["os"] = (OS_ANDROID) ? "android" : "ios";
    if (Ti.App.Properties.hasProperty("session")) {
        parameter["session"] = Ti.App.Properties.getString("session");
    }
    if (cacheTime>0 && !Ti.App.Properties.hasProperty(cacheID)) {
        Ti.App.Properties.setString(cacheID,0);
    }

    var xhr = Ti.Network.createHTTPClient({
        onerror: function(e) {
            if (error)
                error();
        },
        onload: function(e) {

            if (this.readyState === 4) {
                // download done
                var data = "";
                if (isDebug) Ti.API.info(this.responseText);
                if (this.responseText !== "") {
                    data = JSON.parse(this.responseText);

                    if (data.alert !== undefined) {
                        alert(data.alert);
                    }
                }
                if (success)
                    success(data);
            }
        },
        timeout: 10000
    });

    // only check if cache time is over
    var date = new Date();
    if (cacheTime===0 || date - new Date(Ti.App.Properties.getString(cacheID))>cacheTime*1000) {

        Ti.App.Properties.setString(cacheID, date);

        if (type == "POST") {
            // POST
            //
            if (Ti.Network.online) {
                if (opt.binary) {
                    xhr.setRequestHeader("ContentType", "multipart/form-data");
                }
                if (isDebug) Ti.API.info("sending..");
                xhr.open(type, url);
                xhr.send(parameter);
            } else {
                if (isDebug) Ti.API.info("offline");
                if (error) {
                    error();
                }
            }
        } else {
            // GET
            //
            if (Ti.Network.online) {
                xhr.open(type, url);
                xhr.send();
            } else {
                if (isDebug) Ti.API.info("offline");
                if (error) {
                    error();
                }
            }
        }
    } else {
        if (isDebug) Ti.API.info("Skipping request");
    }
}
