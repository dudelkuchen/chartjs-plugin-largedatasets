import Chart from 'chart.js';

var helpers = Chart.helpers;
var defaultOptions = {
    groupSize: 1,
    caculateForCanvasSize: false,
    recalculationMode: 'none',
};

class DataGrouping {
    constructor(area, pixelSize) {
        this.area = area;
        this.pixelSize = pixelSize;
    }

    groupData(data) {
        var dictionary = new PointDoubleValueDictionary();
        var minMax = this.getMinMaxFromData(data)
        var minMaxX = minMax.minMaxX;
        var minMaxY = minMax.minMaxY;
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

    getMinMaxFromData(data) {
        var minMaxX = {min: data[0].x, max: data[0].x };
        var minMaxY = {min: data[0].y, max: data[0].y }
        for (let i = 1; i < data.length; i++) {
            if (minMaxX.min > data[i].x)
                minMaxX.min = data[i].x;
            else if (minMaxX.max < data[i].x)
                minMaxX.max = data[i].x;
            
            if (minMaxY.min > data[i].y)
                minMaxY.min = data[i].y;
            else if (minMaxY.max < data[i].y)
                minMaxY.max = data[i].y;
        }
        return {minMaxY, minMaxX};
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

class CanvasSizeTracker  {
    constructor() {
        this._lastCanvasSize = { width: 0, height: 0};
        this._currentCanvasSize = { width: 0, height: 0};
        this._deviation = 0.05
    }

    update(chart) {
        this._lastCanvasSize = this._currentCanvasSize;
        this._currentCanvasSize = { width: chart.canvas.width, height: chart.canvas.height };
    }

    hasSizeChanged(chart) {
        var currentSize = this._currentCanvasSize.width * this._currentCanvasSize.height;
        var lastSize = this._lastCanvasSize.width * this._lastCanvasSize.height;
        if (currentSize > lastSize * (1 + this._deviation))
            return 1;
        else if (currentSize < lastSize * (1 - this._deviation))
            return -1;
        return 0;
    }
}

class ChartTooltipHandler {
    constructor() {
        this._chart = undefined
        this._timer = undefined
        this._position = {x: -1, y: -1}
    }

    trackChart(chart) {
        this._chart = chart
        this._chart.canvas.addEventListener('mousemove', this._mouseMove.bind(this))
    }

    _mouseMove(e) {
        clearTimeout(this._timer);
        var mousePosition = {x: e.offsetX, y: e.offsetY};
        var diff = this._pointDiff(this._position, mousePosition);
        if (diff > 20) {
            this._chart.options.tooltips.enabled = false;
            this._chart.render({duration: 1, lazy: true});
            this._timer=setTimeout(this._mouseStoppedMoving.bind(this), 30);
        }
        this._position = mousePosition;
    }

    _mouseStoppedMoving() {
        this._chart.options.tooltips.enabled = true;
        this._chart.render({duration: 1, lazy: true});
    }

    _pointDiff(pt1, pt2) {
        return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
    }
}

var largeDatasetsPlugin = {
    id: 'largeDatasets',
    _calculated: false,
    _canvasSizeTracker: new CanvasSizeTracker(),
    _chartTooltipHandler: new ChartTooltipHandler(),
    _dataCache: [],

    afterInit: function(chart) {
        this._canvasSizeTracker.update(chart);
        this._chartTooltipHandler.trackChart(chart)
        this._updateFunction(chart);
    },

    beforeUpdate: function(chart) {
        if (this._calculated)
            return;
        var canvasSize = this._getCalculationRange(chart);
        var datasets = chart.data.datasets;
        if (this._shouldUseCachedData) {
            for (let i = 0; i < this._dataCache.length; i++)
                datasets[i].data = this._dataCache[i].data;
        }
        datasets.forEach(function(dataset) {
            if (dataset.data.length === 0)
                return;
            var pixelSize = this._getOption(chart, "groupSize");
            var dataGrouping = new DataGrouping({width: canvasSize.width, height: canvasSize.height}, pixelSize);
            var groupedData = dataGrouping.groupData(dataset.data);
            dataset.data = groupedData;
        }.bind(this));
        this._calculated = true;
    },

    beforeDraw: function(chart, e) {
        var zv = 0;
        return zv;
    },

    resize: function(chart) {
        this._canvasSizeTracker.update(chart);
        if (!this._getOption(chart, "caculateForCanvasSize")) {
            var resized = this._canvasSizeTracker.hasSizeChanged(chart);
            var recalculationMode = this._getOption(chart, 'recalculationMode');
            switch (recalculationMode) {
                case "resize": this._calculated = resized == 0; break;
                case "increase": this._calculated = resized != 1; break;
                case "decrease": this._calculated = resized != -1; break;
            }
        }
    },

    destroy: function(chart) {
        this._calculated = false;
    },

    _getCalculationRange: function(chart) {
        var canvasSize = { width: chart.canvas.width, height: chart.canvas.height };
        var canvasSizeOptions = this._getOption(chart, "caculateForCanvasSize");
        if (canvasSizeOptions) {
            canvasSize.width = canvasSizeOptions.width;
            canvasSize.height = canvasSizeOptions.height;
        }
        return canvasSize;
    },

    _getOption: function(chart, category) {
        return helpers.getValueOrDefault(chart.options.plugins.largeDatasets[category] ? chart.options.plugins.largeDatasets[category] : undefined, defaultOptions[category]);
    },

    _updateFunction: function(chart) {
        if (this._getOption(chart, 'saveFullData') || this._getOption(chart, 'recalculationMode') == "resize" 
                                                  || this._getOption(chart, 'recalculationMode') == "increase" ) {
            chart.data.datasets.forEach(function(dataset) {
                this._dataCache.push({ data: JSON.parse(JSON.stringify(dataset.data))});
            }.bind(this))
        }
        this._calculated = false;
    },

    _shouldUseCachedData : function(chart) {
        return (this._getOption(chart, 'recalculationMode') == "resize" 
            || this._getOption(chart, 'recalculationMode') == "increase") && this._canvasSizeTracker.hasSizeChanged(chart) == 1
            && this._dataCache != undefined;
    }

}


export default largeDatasetsPlugin;
