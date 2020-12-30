'use strict';

import Chart from 'chart.js';
import LargeDatasetsPlugin from './largedatasets';

Chart.plugins.register(LargeDatasetsPlugin);

export default LargeDatasetsPlugin;