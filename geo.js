exports.create = function(opt) {
    return new Geo(opt);
};
var locationAdded = false;

function Geo(opt) {
    // geolocation
    var lon = 0;
    var lat = 0;
    var isDebug = opt.debug || false;
    var hasGeo = false;
    var isNetwork = false;
    var updatePosition = (opt !== null && opt.updatePosition !== null) ? opt.updatePosition : null;

    this.checkGeo = function() {
        return hasGeo;
    };

    this.isNetwork = function() {
        return isNetwork;
    };

    this.remove = function() {
        removeHandler();
    };

    this.init = function() {
        if (Ti.Geolocation.locationServicesEnabled) {
            // iOS wants to know why
            if (isDebug) Ti.API.info("Geo enabled");
            Ti.Geolocation.purpose = 'Get Current Location';
            if (OS_ANDROID) {
                // android geo stuff
                Ti.Geolocation.Android.manualMode = true;

                var gpsProvider = Ti.Geolocation.Android.createLocationProvider({
                    name: Ti.Geolocation.PROVIDER_GPS,
                    minUpdateTime: 60 * 2,
                    minUpdateDistance: 20
                });

                var netProvider = Ti.Geolocation.Android.createLocationProvider({
                    name: Ti.Geolocation.PROVIDER_NETWORK,
                    minUpdateTime: 60 * 2,
                    minUpdateDistance: 20
                });

                var gpsRule = Ti.Geolocation.Android.createLocationRule({
                    provider: Ti.Geolocation.PROVIDER_GPS,
                    minAge: 1000 * 60
                });

                var netRule = Ti.Geolocation.Android.createLocationRule({
                    provider: Ti.Geolocation.PROVIDER_NETWORK,
                    minAge: 1000 * 60
                });

                Ti.Geolocation.Android.addLocationProvider(netProvider);
                Ti.Geolocation.Android.addLocationProvider(gpsProvider);
                Ti.Geolocation.Android.addLocationRule(gpsRule);
                Ti.Geolocation.Android.addLocationRule(netRule);
            } else {
                // ios geo stuff
                Ti.Geolocation.purpose = 'Get Current Location';
                Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HUNDRED_METERS;
                Ti.Geolocation.distanceFilter = 10;
                Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
            }
            hasGeo = true;
            Titanium.Geolocation.getCurrentPosition(function(e) {
                location(e);
            });

            // get position
            Titanium.Geolocation.addEventListener('location', location);
            locationAdded = true;
            isNetwork = false;
        } else {
            if (isDebug) Ti.API.info("Geo disabled");
            hasGeo = false;
            if (!Ti.App.Properties.hasProperty("lat")) {
                // only set to zero if not available - otherwise keep old value
                Ti.App.Properties.setDouble("lat", 0);
                Ti.App.Properties.setDouble("lon", 0);
            }
        }
    };

    function location(e) {
        //Ti.API.info(JSON.stringify(e));

        if (e.error) {
            //
            //hasGeo = false;
            if (isDebug) {
                console.error("Geo error");
                console.error(e.error);
            }
        } else {

            if (e.coords) {
                lat = parseFloat(e.coords.latitude).toFixed(5);
                lon = parseFloat(e.coords.longitude).toFixed(5);

                // check if its really a new position
                if (Ti.App.Properties.getDouble("lat") != lat && Ti.App.Properties.getDouble("lon") != lon) {
                    if (isDebug) Ti.API.info("Got new location: " + lat + " - " + lon);
                    Ti.App.Properties.setDouble("lat", lat);
                    Ti.App.Properties.setDouble("lon", lon);
                    if (updatePosition) {

                        var date = new Date();
                        Ti.App.Properties.setString("lastLoc", date);
                        updatePosition();
                    }
                    hasGeo = true;
                }
            }
        }
    }

    Ti.App.addEventListener("events:remove", function(e) {
        Titanium.Geolocation.removeEventListener('location', location);
        locationAdded = false;
        hasGeo = false;

    });

    function removeHandler(e) {
        if (locationAdded) {
            Titanium.Geolocation.removeEventListener('location', location);
            locationAdded = false;
            hasGeo = false;
            if (isDebug) Ti.API.info("remove geo events");

        }
    }

    function addHandler(e) {
        if (!locationAdded) {
            Titanium.Geolocation.addEventListener('location', location);
            locationAdded = true;
            if (isDebug) Ti.API.info("add geo events");
        }
    }

    this.setLon = function(l) {
        lon = parseFloat(l).toFixed(5);
        Ti.App.Properties.setDouble("lon", lon);
    };

    this.setLat = function(l) {
        lat = parseFloat(l).toFixed(5);
        Ti.App.Properties.setDouble("lat", lat);
    };

    this.lon = function() {
        return Ti.App.Properties.getDouble("lon");
    };

    this.lat = function() {
        return Ti.App.Properties.getDouble("lat");
    };

    this.getDistance = function(opt) {
        //Convert input values to radians

        var R = 6371;
        var lat1 = opt.lat;
        var lon1 = opt.lon;
        var lat = Ti.App.Properties.getDouble("lat");
        var lon = Ti.App.Properties.getDouble("lon");

        if (lat1 !== null && lon1 !== null && lat !== null && lon !== null && lat !== 0 && lon !== 0) {
            // distance
            var dLat = (lat - lat1) * Math.PI / 180;
            var dLon = (lon - lon1) * Math.PI / 180;
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;

            return {
                distance: d.toFixed(1)
            };
        } else {
            return -1;
        }
    };

    if (OS_ANDROID) {
        Ti.App.addEventListener('pause', removeHandler);
        Ti.App.addEventListener('resume', addHandler);
    }
}
