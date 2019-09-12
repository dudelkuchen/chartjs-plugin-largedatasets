class AxisInfo {
    constructor(axis) {
        this.axis = axis;
    }

    get width() {
        return this.axis.right - this.axis.left;
    }

    get height() {
        return this.axis.bottom - this.axis.top;
    }

    get minValue() {
        return this.axis.min;
    }

    get maxValue() {
        return this.axis.max;
    }

    getPointPercentage(value, min, max) {
        var ratio = (value - min) / (max - min);
        return ratio;
    }

    getPixelPositionWidth(value, min, max) {
        return Math.floor(this.getPointPercentage(value, min, max) * 1428);
    }

    getPixelPositionHeight(value, min, max) {
        return Math.floor(this.getPointPercentage(value, min, max) * 714);
    }
}

var largeDatasetPlugin = {
    id: 'largeDatasets',

    beforeUpdate: function(chart) {
        if (!chart.scales["x-axis-0"])
            return true;
        var xAxisInfo = new AxisInfo(chart.scales["x-axis-0"]);
        var yAxisInfo = new AxisInfo(chart.scales["y-axis-0"]);
        chart.data.datasets.forEach(function(dataset) {
            var dictionary = {};
            var maxY = Math.max.apply(Math, dataset.data.map(function(o) { return o.y; }));
            var maxX = Math.max.apply(Math, dataset.data.map(function(o) { return o.x; }));
            var minY = Math.min.apply(Math, dataset.data.map(function(o) { return o.y; }));
            var minX = Math.min.apply(Math, dataset.data.map(function(o) { return o.x; }));
            for (let i = 0; i < dataset.data.length; i++) {
                var x = xAxisInfo.getPixelPositionWidth(dataset.data[i].x, minX, maxX);
                var y = yAxisInfo.getPixelPositionHeight(dataset.data[i].y, minX, maxY);
                if (!dictionary.hasOwnProperty(y))
                    dictionary[y] = {};
                dictionary[y][x] = dataset.data[i];
            }
            var data = [];
            for (var yValue in dictionary) {
                if (Object.prototype.hasOwnProperty.call(dictionary, yValue)) {
                    for (var xValue in dictionary[yValue])
                        data.push(dictionary[yValue][xValue])
                }
            }
            dataset.data = data;
        });
    }
}

Chart.plugins.register(largeDatasetPlugin);