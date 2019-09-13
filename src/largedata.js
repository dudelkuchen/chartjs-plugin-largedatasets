class DataGrouping {
    constructor(area, pixelSize) {
        this.area = area;
        this.pixelSize = pixelSize;
    }

    groupData(data) {
        var dictionary = {};
        var minMaxX = this.getMinMaxXFromData(data);
        var minMaxY = this.getMinMaxYFromData(data);
        for (let i = 0; i < data.length; i++) {
            var x = this.getPixelPositionWidth(data[i].x, minMaxX.min, minMaxX.max);
            var y = this.getPixelPositionHeight(data[i].y, minMaxY.min, minMaxY.max);
            if (!dictionary.hasOwnProperty(x))
                dictionary[x] = {};
            dictionary[x][y] = data[i];
        }
        var groupedData = [];
        for (var xValue in dictionary) {
            if (Object.prototype.hasOwnProperty.call(dictionary, xValue)) {
                for (var yValue in dictionary[xValue])
                groupedData.push(dictionary[xValue][yValue])
            }
        }
        return groupedData;
    }

    getPointPercentage(value, min, max) {
        return (value - min) / (max - min);
    }

    getPixelPositionWidth(value, min, max) {
        return Math.floor(this.getPointPercentage(value, min, max) * this.area.width);
    }

    getPixelPositionHeight(value, min, max) {
        return Math.floor(this.getPointPercentage(value, min, max) * this.area.height);
    }

    getMinMaxXFromData(data) {
        var minMax = {min: data[0].x, max: data[0].x };
        for (let i = 1; i < data.length; i++) {
            if (minMax.min > data[i].x)
                minMax.min = data[i].x;
            else if (minMax.max < data[i].x)
                minMax.max = data[i].x;
        }
        return minMax;
    }
    
    getMinMaxYFromData(data) {
        var minMax = {min: data[0].y, max: data[0].y }
        for (let i = 1; i < data.length; i++) {
            if (minMax.min > data[i].y)
                minMax.min = data[i].y;
            else if (minMax.max < data[i].y)
                minMax.max = data[i].y;
        }
        return minMax;
    }
}

var largeDatasetPlugin = {
    id: 'largeDatasets',

    beforeUpdate: function(chart) {
        chart.data.datasets.forEach(function(dataset) {
            if (dataset.data.length == 0)
                return;
            var dataGrouping = new DataGrouping({width: chart.canvas.width, height: chart.canvas.height}, 1);
            groupedData = dataGrouping.groupData(dataset.data);
            dataset.data = groupedData;
        });
    }
}

Chart.plugins.register(largeDatasetPlugin);