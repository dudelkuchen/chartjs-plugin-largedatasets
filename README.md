# chartjs-plugin-largedatasets


[Chart.js](http://www.chartjs.org/) plugin to display large datasets in a line chart by grouping the data points. 

Requires [Chart.js](https://github.com/chartjs/Chart.js/releases) **2.8.0** or later.

## Example

```javascript
new Chart(ctx, {
  // ... data ...
  options: {
    // ... other options ...
    plugins: {
      largedatasets: {
          groupSize: 1, // defines the grouping size in pixel
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
| [`recalculateMode`](#color) | `[resize, increase, decrease, none]` | `none`


#### `groupingSize`
The pixel area in which a single data point is displayed. Default is 1

#### `calculateForCanvasSize`
The canvas size for which the algorithm calculates the required points. Default ist not set.
If this options is activated the recalculateMode option is ignored. 

#### `recalculateMode`
Indicates for which resize event the data point resolution should be recalculated.

* `none`: The data point resolution is not recalculated.
* `decrease`: Recalculation when reducing the canvas size.
* `increase`: Recalculation when increasing the canvas size.
* `resize`: Recalculation for every resize event.

When setting the `recalculateMode` to `increase` or `resize` the algorithm uses the original data to calculate the resoltion. So the original Data will be cached which takes much longer calculation time and memory. Don't this mode with extremly big data.

### Example

The following snippet presents the usage of the options
```javascript
new Chart(ctx, {
  // ... data ...
  options: {
    // ... other options ...
    plugins: {
      largedatasets: {
          groupSize: 1, // defined the grouping size for data points
      }
    }
  }
});
```

## License
`chartjs-plugin-largedatasets` is available under the [MIT license](LICENSE.md).