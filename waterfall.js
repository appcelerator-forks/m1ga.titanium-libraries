exports.create = function(opt) {
    return new Waterfall(opt);
};


function Waterfall(opt) {
    var gridObject = opt.grid;
    var width = Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor;
    var lastRow = 0;
    var itemAmount = (opt.itemCount !== undefined) ? opt.itemCount : (Alloy.isTablet ? 6 : 4);
    var itemWidth = Math.floor(width / itemAmount);
    var currentX = 0;
    var currentY = 0;
    var grid = [];


    this.getItemWidth = function() {
        return itemWidth;
    };

    function addRow() {
        grid.push([]);
        for (var i = 0; i < itemAmount; ++i) {
            grid[grid.length - 1].push(0);
        }
    }

    addRow();


    function getNextX(s, t, p) {
        if (currentX + s > itemAmount) {

            // add blank
            if (currentX < itemAmount && grid[currentY][currentX] === 0) {

                var place = Ti.UI.createView(p);
                place.left = currentX * itemWidth;
                place.top = currentY * itemWidth;
                place.width = itemWidth;
                place.height = itemWidth;
                gridObject.add(place);

            }

            currentX = 0;
            currentY += 1;


            if (grid.length - 1 < currentY) {
                // add new row
                //for (var i=0; i<t;++i){
                addRow();
                //}
            }
        }


        if (grid[currentY][currentX] === 0) {
            if (s == 2) {
                if (grid[currentY][currentX + 1] === 0) {
                    return;
                } else {
                    // add blank

                    var place = Ti.UI.createView(p);
                    place.left = currentX * itemWidth;
                    place.top = currentY * itemWidth;
                    place.width = itemWidth;
                    place.height = itemWidth;
                    gridObject.add(place);

                    currentX += 2;
                    getNextX(s, t, p);
                }
            }
            return;
        } else {


            currentX += 1;
            getNextX(s, t, p);
        }
    }

    this.addItem = function(opt) {
        var x = opt.size.x;
        var y = opt.size.y;
        var obj = opt.object;
        var p = opt.placeholder;

        var r = obj.width / obj.height;

        getNextX(x, y, p);


        var v = Ti.UI.createView({
            left: currentX * itemWidth,
            top: currentY * itemWidth,
            width: itemWidth * x,
            height: itemWidth * y
        });

        if (opt.resize) {
            // resize content to fit box
            if (obj.height < v.height) {
                obj.height = v.height;
                obj.width = v.height * r;
            }

            if (obj.width < v.width) {
                obj.width = v.width;
                obj.height = v.width / r;
            }
            obj.left = 0 - (obj.width - (itemWidth * x)) * 0.5;
            obj.top = 0 - (obj.height - (itemWidth * y)) * 0.5;
        } else {
            obj.left = 0;
            obj.top = 0;
        }




        v.add(obj);

        // check y
        if (grid.length < currentY + y) {
            for (var j = 0; j < y; ++j) {
                addRow();
            }
        }

        for (var jy = 0; jy < y; ++jy) {
            for (var j = 0; j < x; ++j) {
                grid[currentY + jy][currentX + j] = 1;
            }
        }


        gridObject.add(v);

        currentX += x;
        return v;
    };

    this.clear = function() {
        grid = [];
        addRow();
        currentX = 0;
        currentY = 0;
    };
}
