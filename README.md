# chartjs-plugin-largedatasets


[Chart.js](http://www.chartjs.org/) plugin to display large datasets in a line diagram using an algorithm to group the data point. 

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
`chartjs-plugin-crosshair` is available under the [MIT license](LICENSE.md).