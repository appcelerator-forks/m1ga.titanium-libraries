exports.create = function(opt) {
    return new API(opt);
};

function API(opt) {
    var url = opt.url;
    var type = opt.type;
    var success = (opt.success) ? opt.success : null;
    var error = (opt.error) ? opt.error : null;
    var parameter = {};
    for (var obj in opt.parameter) {
        parameter[obj] = (obj != "media") ? String(opt.parameter[obj]) : opt.parameter[obj];
    }
    parameter["udid"] = String(Ti.Platform.id);
    parameter["version"] = String(Ti.App.version);
    parameter["os"] = (OS_ANDROID) ? "android" : "ios";
    if (Ti.App.Properties.hasProperty("session")) {
        parameter["session"] = Ti.App.Properties.getString("session");
    }

    var xhr = Ti.Network.createHTTPClient({
        onerror: function(e) {
            if (error)
                error();
            //Ti.API.info(e);
        },
        onload: function(e) {

            if (this.readyState === 4) {
                // download done
                var data = "";
                Ti.API.info(this.responseText);
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

    if (type == "POST") {
        // POST
        //
        if (Ti.Network.online) {
            if (opt.binary) {
                xhr.setRequestHeader("ContentType", "multipart/form-data");
            }
            Ti.API.info("sending..");
            xhr.open(type, url);
            xhr.send(parameter);
        } else {
            Ti.API.info("offline");
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
            Ti.API.info("offline");
            if (error) {
                error();
            }
        }
    }
}
