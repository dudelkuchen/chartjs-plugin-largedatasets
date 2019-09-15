import Chart from 'chart.js';

var helpers = Chart.helpers;
var defaultOptions = {
    groupSize: 1,
    caculateForCanvasSize: false,
};

class DataGrouping {
    constructor(area, pixelSize) {
        this.area = area;
        this.pixelSize = pixelSize;
    }

    groupData(data) {
        var dictionary = new PointDoubleValueDictionary();
        var minMaxX = this.getMinMaxXFromData(data);
        var minMaxY = this.getMinMaxYFromData(data);
        for (let i = data.length - 1; i >= 0; i--) {
            var x = this.getPixelPositionWidth(data[i].x, minMaxX.min, minMaxX.max);
            var y = this.getPixelPositionHeight(data[i].y, minMaxY.min, minMaxY.max);
            dictionary.add(x,y, data[i], i);
        }
        return dictionary.getDictionaryValues();
    }

    getPointPercentage(value, min, max) {
        return (value - min) / (max - min);
    }

    getPixelPositionWidth(value, min, max) {
        return Math.floor(this.getPointPercentage(value, min, max) * this.area.width / this.pixelSize);
    }

    getPixelPositionHeight(value, min, max) {
        return Math.floor(this.getPointPercentage(value, min, max) * this.area.height / this.pixelSize);
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

class PointDoubleValueDictionary {
    constructor() {
        this._innerDictionary = {};
    }

    add(key1, key2, data, index) {
        if (!this._innerDictionary.hasOwnProperty(key1))
            this._innerDictionary[key1] = {};
        this._innerDictionary[key1][key2] = {data, index};
    }

    getDictionaryValues() {
        var groupedData = [];
        for (var xValue in this._innerDictionary) {
            for (var yValue in this._innerDictionary[xValue])
                groupedData.push(this._innerDictionary[xValue][yValue])
        }
        return groupedData.sort((a, b) => (a.index > b.index) ? 1 : -1).map((d) => d.data);
    }
}

var largeDatasetsPlugin = {
    id: 'largeDatasets',
    _calculated: false,

    beforeUpdate: function(chart) {
        if (!this.getOption(chart, "caculateForCanvasSize") && this._calculated)
            return;
        var canvasSize = this.getCalculationRange(chart);
        chart.data.datasets.forEach(function(dataset) {
            if (dataset.data.length === 0)
                return;
            var pixelSize = this.getOption(chart, "groupSize");
            var dataGrouping = new DataGrouping({width: canvasSize.width, height: canvasSize.height}, pixelSize);
            var groupedData = dataGrouping.groupData(dataset.data);
            dataset.data = groupedData;
        }.bind(this));
        this._calculated = true;
    },

    getCalculationRange: function(chart) {
        var canvasSize = { width: chart.canvas.width, height: chart.canvas.height };
        var canvasSizeOptions = this.getOption(chart, "caculateForCanvasSize");
        if (canvasSizeOptions) {
            canvasSize.width = canvasSizeOptions.width;
            canvasSize.height = canvasSizeOptions.height;
        }
        return canvasSize;
    },

    getOption: function(chart, category) {
        return helpers.getValueOrDefault(chart.options.plugins.largeDatasets[category] ? chart.options.plugins.largeDatasets[category] : undefined, defaultOptions[category]);
    }
}

Chart.plugins.register(largeDatasetsPlugin);