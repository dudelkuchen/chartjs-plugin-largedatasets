'use strict';

import Chart from 'chart.js';

function getCanvasSize(chart) {
    return  {
        width: chart.canvas.parentNode.style.width,
        height: chart.canvas.parentNode.style.height,
    };
}

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

    getPointPercentage(value) {
        return (value - this.axis.min) / (this.axis.max - this.axis.min);
    }

    getPixelPositionWidth(value) {
        return Math.floor(this.getPointPercentage(value) * this.axis.width);
    }

    getPixelPositionHeight(value) {
        return Math.floor(this.getPointPercentage(value) * this.axis.height);
    }
}

var largeDatasetPlugin = {
    id: 'largeDatasets',

    beforeUpdate: function(chart) {
        var xAxisInfo = new AxisInfo(chart.scales["x-axis-0"]);
        var yAxisInfo = new AxisInfo(chart.scales["x-axis-1"]);
        chart.data.datasets.forEach(function(dataset) {
            var dictionary = {};
            dataset.data.forEach(function(data) {
                var x = xAxisInfo.getPixelPositionWidth(data.x),
                var y = xAxisInfo.getPixelPositionHeight(data.y)
                dictionary[x][y] = data;
            });
        })
    }
}

Chart.plugins.register(largeDatasetsPlugin);