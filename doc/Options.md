### Options

| Name | Type | Default
| ---- | ---- | ----
| [`groupingSize`](#color) | `Number` | 1


#### `groupingSize`
The pixel area in which a single data point is displayed. 

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