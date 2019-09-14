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

## License
`chartjs-plugin-largedatasets` is available under the [MIT license](LICENSE.md).