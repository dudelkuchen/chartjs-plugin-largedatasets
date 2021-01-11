# chartjs-plugin-largedatasets


[Chart.js](http://www.chartjs.org/) plugin to display large datasets in a line chart. The plugin reduces the number of data points drawn for a defined number of pixels. This way, only points that are actually needed will be displayed. 

Requires [Chart.js](https://github.com/chartjs/Chart.js/releases) **2.8.0** or later.

## Example

```javascript
new Chart(ctx, {
  // ... data ...
  options: {
    // ... other options ...
    plugins: {
      largedatasets: {
          groupSize: 1, // defines on how many pixels a point is drawn. 
          recalculationMode: 'none', // no recalculation after window resize
      }
    }
  }
});
```

### Options

| Name | Type | Default
| ---- | ---- | ----
| [`groupingSize`](#color) | `Number` | `1`
| [`caculateForCanvasSize`](#color) | `{width: x, height: y}` | `false`
| [`recalculationMode`](#color) | `[resize, increase, decrease, none]` | `none`
| [`tooltipOptimization`](#color) | `Boolean`  | `true`


#### `groupingSize`
The pixel area in which a single data point is displayed. E.g one datapoint per 2x2 pixel if set to 2. Default value is 1.

#### `calculateForCanvasSize`
Fixed canvas size for which the algorithm calculates the required points. If not set, the plugin uses the current canvas size. If this options is activated the recalculationMode option is ignored. 

#### `recalculationMode`
Indicates for which resize event the data point resolution should be recalculated.

* `none`: The data point resolution is not recalculated.
* `decrease`: Recalculation when reducing the canvas size.
* `increase`: Recalculation when increasing the canvas size.
* `resize`: Recalculation for every resize event.

When setting the `recalculationMode` to `increase` or `resize` the algorithm uses the original data to calculate the resolution. So the original data will be cached which takes much longer calculation time and memory. Don't use this mode with extremly big data.

#### `tooltipOptimization`
optimizes the rendering of tooltips. The tooltips animations are now only displayed during short mouse movements, otherwise the tooltip is only displayed as soon as the mouse stops moving. This means that delays no longer occur with very large datasets. 

## Development

You first need to install node dependencies (requires [Node.js](https://nodejs.org/)):

    > npm install

The following commands will then be available from the repository root:

    > gulp build            // build dist files
    > gulp lint             // perform code linting


## License
`chartjs-plugin-largedatasets` is available under the [MIT license](LICENSE.md).