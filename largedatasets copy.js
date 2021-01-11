import Chart from 'chart.js';

var helpers = Chart.helpers;
var defaultOptions = {
    groupSize: 1,
    caculateForCanvasSize: false,
    recalculationMode: 'none',
    tooltipOptimization: false
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
        dictionary.rangeX = minMaxX;
        dictionary.rangeY = minMaxY;
        for (let i = data.length - 1; i >= 0; i--) {
            var x = this.getPixelPositionWidth(data[i].x, minMaxX.min, minMaxX.max);
            var y = this.getPixelPositionHeight(data[i].y, minMaxY.min, minMaxY.max);
            dictionary.add(x,y, data[i], i);
        }
        return dictionary;
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
        this._innerDictionary = new Map();
        this.rangeX = {min: 0, max: 0}
        this.rangeY = {min: 0, max: 0}
    }

    add(key1, key2, data, index) {
        if (!this._innerDictionary.has(key1))
            this._innerDictionary.set(key1, new Map());
        this._innerDictionary.get(key1).set(key2,  {data, index});
    }

    getDictionaryValues() {
        var groupedData = [];
        var counter = 0;
        let entries = this._innerDictionary.entries();
        for (let [key, map] of entries) {
            let innerEntries = map.entries()
            for (let [key2, value] of innerEntries) {
                groupedData.push(value);
            }
        }

        var counter = 0;
        return groupedData.sort((a, b) => (a.index > b.index) ? 1 : -1).map((d) => { d["index"] = counter++; return d.data});
    }

    get(key1, key2) {
        var data = this._innerDictionary.get(key1);
        if (data != undefined)
            var data2 = data.get(key2);
            if (data2 != undefined)
                return data2;
        return undefined;
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
        this._canvas = undefined
        this._position = {x: -1, y: -1}
        this._myMouseMove = this._mouseMove.bind(this)
        this._events = []
    }

    trackChart(chart) {
        this._chart = chart;
        this._chart.options.events = [];
        this._canvas = chart.canvas;
        this._canvas.addEventListener('click', this._myMouseMove)
    }

    _getRange(number, offset) {
        return { min: Math.ceil(number) - offset, max: Math.floor(number) + offset };
    }

    _mouseMove(e) {
        var mousePosition = {x: e.offsetX, y: e.offsetY};
        this._findPointInArea(mousePosition)
    }

    _findPointInArea(point) {
        var width = this._chart.canvas.width;
        var height = this._chart.canvas.height;

        // difference between min/max value of data point and axis
        var diff_min_point_axis = (this._chart.data.datasets[0]._dictData.rangeY.min - this._chart.scales["y-axis-0"].min) 
                                                / (this._chart.scales["y-axis-0"].max - this._chart.scales["y-axis-0"].min);
        var diff_min_point_axis_pixel = (this._chart.chartArea.bottom - this._chart.chartArea.top) * diff_min_point_axis;

        var diff_max_point_axis = (this._chart.data.datasets[0]._dictData.rangeY.max - this._chart.scales["y-axis-0"].min) 
                                                    / (this._chart.scales["y-axis-0"].max - this._chart.scales["y-axis-0"].min);
        var diff_max_point_axis_pixel = (this._chart.chartArea.bottom - this._chart.chartArea.top) * (1 - diff_max_point_axis);

        // x,y position on canvas
        var x = point.x - this._chart.chartArea.left;
        var y = point.y - this._chart.chartArea.top - diff_max_point_axis_pixel;

        // x,y position in percent
        var percX  = x / (this._chart.chartArea.right - this._chart.chartArea.left);
        var percY = y / (this._chart.chartArea.bottom - this._chart.chartArea.top - diff_max_point_axis_pixel - diff_min_point_axis_pixel);
        var newX = width * percX;
        var newY = height - (height * percY);

        // consider offset for each point
        var xRange = this._getRange(newX, 3);
        var yRange = this._getRange(newY, 3);

        var points = [];
        for (var i = xRange.min; i <= xRange.max; i++) {
            for (var k = yRange.min; k <= yRange.max; k++) {
                var pt = this._chart.data.datasets[0]._dictData.get(i, k);
                if (pt != undefined) {
                    points.push(pt);
                }
            }
        }

        var data = this._chart.getDatasetMeta(0);  
        this._chart.tooltip.initialize();

        var tooltipPoints = [];
        for (let i = 0; i < Math.min(points.length, 5); i++)
            tooltipPoints.push(data.data[points[i].index]);
        
        this._chart.tooltip._active = tooltipPoints;
        this._chart.tooltip.update(true);
        this._chart.render({duration: 2, lazy: false});  
    }
}

class ChartTracker {
    constructor() {
        this._charts = {}
    }

    addChart(chart) {
        var tooltipHandler = new ChartTooltipHandler();
        tooltipHandler.trackChart(chart);
        this._charts[chart.id] = tooltipHandler;
    }

    removeChart(chart) {
        this._charts[chart.id].untrackChart()
    }
}

var largeDatasetsPlugin = {
    id: 'largeDatasets',
    _calculated: false,
    _canvasSizeTracker: new CanvasSizeTracker(),
    _chartTooltipTracker: new ChartTracker(),
    _dataCache: [],

    beforeInit: function(chart) {
        if (this._getOption(chart, 'tooltipOptimization'))
            this._chartTooltipTracker.addChart(chart)
    },

    afterInit: function(chart) {
        this._canvasSizeTracker.update(chart);
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
            console.log("Time Filtering")
            var t0 = performance.now()
            var dict = dataGrouping.groupData(dataset.data);
            var t1 = performance.now()
            console.log("Filtered in  " + (t1 - t0) + " milliseconds.")
            dataset.data = dict.getDictionaryValues();
            dataset["_dictData"] = dict;
        }.bind(this));
        this._calculated = true;
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
        this._chartTooltipTracker.removeChart(chart);
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
    },

}


export default largeDatasetsPlugin;
