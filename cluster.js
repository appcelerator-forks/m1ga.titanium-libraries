exports.create = function(opt) {
    return new Cluster(opt);
};

function Cluster(opt) {
    var map = null;
    var midLat = 0;
    var midLon = 0;
    var latDelta = 0;
    var fix = 3;
    var lonDelta = 0;

    map = opt.map;
    map.addEventListener('regionchanged', update);

    function getPixelDistance(_lat1, _lon1, _lat2, _lon2) {
        var latPx = (map.size.height * Math.abs(_lat1 - _lat2)) / (latDelta);
        var lonPx = (map.size.width * Math.abs(_lon1 - _lon2)) / (lonDelta);
        var distance = Math.sqrt(Math.pow((latPx),2) + Math.pow((lonPx),2));
        return distance;
    }

    function getDistance(opt) {
        //Convert input values to radians

        var R = 6371;
        var lat1 = opt.latitude;
        var lon1 = opt.longitude;
        var lat2 = midLat;
        var lon2 = midLon;

        if (lat1 !== null && lon1 !== null && lat2 !== null && lon2 !== null) {

            // distance
            var dLat = (lat2 - lat1) * Math.PI / 180;
            var dLon = (lon2 - lon1) * Math.PI / 180;
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;

            R = null;
            lat1 = null;
            lat2 = null;
            lon1 = null;
            lon2 = null;

            return d.toFixed(1);
        } else {
            R = null;
            lat1 = null;
            lat2 = null;
            lon1 = null;
            lon2 = null;
            return null;
        }
    }

    function checkArray(ar, lon, lat) {
        for (var i = 0; i < ar.length; ++i) {
            if (ar[i].lon == lon && ar[i].lat == lat)
                return i;
        }
        return -1;
    }



    function update(e) {
        midLat = e.latitude;
        midLon = e.longitude;
        latDelta = e.latitudeDelta;
        lonDelta = e.longitudeDelta;

        if (latDelta >= 9 && lonDelta >= 14) {
            fix = -1;
        } else if (latDelta >= 3 && lonDelta >= 4) {
            fix = 0;
        } else if (latDelta >= 1 && lonDelta >= 2) {
            fix = 1;
        } else if (latDelta >= 0 && lonDelta >= 1) {
            fix = 2;
        } else if (latDelta >= 0.25 && lonDelta >= 0.25) {
            fix = 3;
        } else if (latDelta >= 0.1 && lonDelta >= 0.1) {
            fix = 4;
        } else {
            fix = 10;
        }

        if (map.annoBack === undefined || map.annoBack.length === 0) {
            map.annoBack = map.annotations;
        }

        var ar = [];
        for (var i in map.annoBack) {
            var d = getDistance(map.annoBack[i]);

            if (d < latDelta * 60) {
                // inside window
                var vlon = 0;
                var vlat = 0;
                if (fix == -1) {
                    vlon = Math.round(map.annoBack[i].longitude / 5) * 5;
                    vlat = Math.round(map.annoBack[i].latitude / 5) * 5;
                } else {
                    vlon = map.annoBack[i].longitude.toFixed(fix);
                    vlat = map.annoBack[i].latitude.toFixed(fix);
                }
                var check = -1;
                check = checkArray(ar, vlon, vlat);
                if (check > -1) {
                    ar[check].value += 1;
                } else {
                    ar.push({
                        lon: vlon,
                        lat: vlat,
                        value: 1,
                        title: map.annoBack[i].title
                    });
                }
            }
        }

        var annos = [];
        for (var j in ar) {
            var anno = Alloy.Globals.Map.createAnnotation({
                latitude: parseFloat(ar[j].lat),
                longitude: parseFloat(ar[j].lon),
                pincolor: Alloy.Globals.Map.ANNOTATION_RED,
                showInfoWindow: (ar[j].value > 1) ? true : false,
                title: ar[j].title,
                id: j
            });
            annos.push(anno);
        }
        map.setAnnotations(annos);

    }

    this.setData = function(data) {
        map.annoBack = data;
        update({
            latitude: 0,
            longitude: 0,
            latitudeDelta: 120,
            longitudeDelta: 135
        });
    };

}
