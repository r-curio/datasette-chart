# Datasette Chart Plugin

A custom Datasette plugin that adds interactive chart visualizations to table and query pages using Chart.js. The plugin dynamically fetches data from Datasette's JSON API and renders configurable charts based on metadata configuration.

## Features

- **Multiple Chart Types**: Bar charts, line charts, and scatter plots
- **Flexible Configuration**: Global, database, table, and query-specific settings
- **Dynamic Data Fetching**: Real-time data from Datasette's JSON API
- **Responsive Design**: Charts adapt to container size
- **Error Handling**: Graceful degradation when data is unavailable
- **Date Sorting**: Automatic chronological ordering for line charts

## Installation

### 1. Install Chart.js Dependencies

```bash
# Install Chart.js via npm
npm install

# Copy Chart.js to static directory
npm run update-chartjs
```

### 2. Plugin Setup

The plugin is automatically loaded by Datasette when placed in the plugins directory.

## Configuration

### Basic Configuration

Add to your `metadata.yml`:

```yaml
plugins:
  datasette-chart:
    label_column: "category"
    data_column: "value"
    chart_type: "bar"
    chart_title: "My Chart"
```

### Advanced Configuration

```yaml
databases:
  mydb:
    title: "My Database"
    tables:
      my_table:
        plugins:
          datasette-chart:
            chart_type: "line"
            label_column: "date"
            data_column: "sales"
            chart_title: "Sales Over Time"

    queries:
      my_query:
        sql: "SELECT * FROM data WHERE value > 100"
        plugins:
          datasette-chart:
            chart_type: "scatter"
            label_column: "x_value"
            data_column: "y_value"
            chart_title: "Correlation Analysis"
```

### Configuration Options

| Option         | Type    | Default            | Description                             |
| -------------- | ------- | ------------------ | --------------------------------------- |
| `label_column` | string  | "song"             | Column to use for x-axis labels         |
| `data_column`  | string  | "popularity"       | Column to use for y-axis values         |
| `chart_type`   | string  | "bar"              | Chart type: "bar", "line", or "scatter" |
| `chart_title`  | string  | "Table Data Chart" | Chart title                             |
| `debug_mode`   | boolean | false              | Enable debug logging                    |

## Chart Types

### Bar Charts

- **Use Case**: Categorical data comparison
- **Data Structure**: Multiple datasets, one per label
- **Example**: Comparing sales across different categories

### Line Charts

- **Use Case**: Time series data
- **Data Structure**: Single dataset with chronological ordering
- **Features**: Automatic date sorting
- **Example**: Tracking metrics over time

### Scatter Plots

- **Use Case**: Correlation analysis
- **Data Structure**: X,Y coordinate pairs
- **Example**: Analyzing relationships between variables

## Architecture & Design

### Hook Strategy

The plugin uses Datasette's hook system for seamless integration:

- **`extra_js_urls`**: Loads Chart.js library and custom chart logic
- **`extra_body_script`**: Injects plugin configuration into JavaScript

### Data Processing Pipeline

1. **Data Fetching**: Retrieves data from Datasette's JSON API
2. **Validation**: Verifies column existence and data types
3. **Transformation**: Chart-type-specific data processing
4. **Rendering**: Dynamic chart creation with Chart.js

### Configuration Hierarchy

1. Global configuration (base settings)
2. Database-specific overrides
3. Table-specific overrides
4. Query-specific overrides (highest priority)

## Usage Examples

### Example 1: Basic Bar Chart

```yaml
plugins:
  datasette-chart:
    label_column: "artist"
    data_column: "popularity"
    chart_type: "bar"
    chart_title: "Artist Popularity"
```

### Example 2: Time Series Line Chart

```yaml
databases:
  sales:
    tables:
      monthly_sales:
        plugins:
          datasette-chart:
            chart_type: "line"
            label_column: "month"
            data_column: "revenue"
            chart_title: "Monthly Revenue Trend"
```

### Example 3: Correlation Scatter Plot

```yaml
databases:
  analytics:
    queries:
      correlation_analysis:
        sql: "SELECT x_value, y_value FROM data WHERE x_value IS NOT NULL"
        plugins:
          datasette-chart:
            chart_type: "scatter"
            label_column: "x_value"
            data_column: "y_value"
            chart_title: "X vs Y Correlation"
```

## Implementation Details

### Dependencies

```json
{
  "chart.js": "^4.4.0"
}
```

### File Structure

```
datasette-chart/
├── __init__.py          # Plugin hooks and configuration
├── static/
│   ├── chart.js         # Custom chart logic
│   └── chart.min.js     # Chart.js library
├── package.json         # npm dependencies
└── metadata.yml         # Example configuration
```

### Key JavaScript Functions

#### Data Fetching

```javascript
async function fetchTableData() {
  const jsonUrl = `/${database}/${table}.json?_shape=objects&_size=100`;
  const response = await fetch(jsonUrl);
  return response.json();
}
```

#### Chart Type Processing

```javascript
if (pluginConfig.chart_type === "scatter") {
  // X,Y coordinate pairs
} else if (pluginConfig.chart_type === "line") {
  // Labels + values with date sorting
} else {
  // Multiple datasets for bar charts
}
```

## Challenges & Solutions

### 1. Template Detection

**Challenge**: Distinguishing between table and query pages
**Solution**: Check template name in `extra_body_script` hook

```python
if template in ["table.html", "query.html"]:
```

### 2. Configuration Injection

**Challenge**: Passing Python configuration to JavaScript safely
**Solution**: Use `json.dumps()` for proper serialization

```python
return f"window.chartPluginConfig = {json.dumps(final_config)};"
```

### 3. Date Sorting for Line Charts

**Challenge**: Ensuring chronological order for time series data
**Solution**: JavaScript Date parsing and sorting

```javascript
const sortedRows = [...rows].sort((a, b) => {
  const dateA = new Date(a[labelColumn]);
  const dateB = new Date(b[labelColumn]);
  return dateA - dateB;
});
```

### 4. Error Handling

**Challenge**: Graceful degradation when data is unavailable
**Solution**: Container hiding and error messaging

```javascript
if (!chartData) {
  chartContainer.style.display = "none";
  errorMessage.textContent = "No chart data available";
}
```

## Performance Considerations

### Data Limiting

- Default limit of 100 records via `_size=100`
- Configurable via metadata

### Chart.js Loading

- Local bundling reduces external dependencies
- UMD format ensures compatibility

### DOM Manipulation

- Efficient container insertion before table
- Minimal DOM queries

## Security Considerations

### JSON Injection Prevention

- Proper serialization with `json.dumps()`
- No direct string concatenation

### Data Validation

- Column existence verification
- Type checking for numeric operations

### XSS Prevention

- Chart.js handles data sanitization
- No direct innerHTML manipulation

## Limitations

1. **Fixed Chart Size**: 300px height, 800px max width
2. **Limited Chart Types**: Only bar, line, and scatter supported
3. **Data Size**: Hard-coded 100 record limit
4. **Date Format**: Assumes standard date formats

## Future Enhancements

1. **Responsive Sizing**: Dynamic chart dimensions
2. **Additional Chart Types**: Pie, doughnut, area charts
3. **Interactive Features**: Zoom, pan, tooltip customization
4. **Data Export**: Chart image download
5. **Real-time Updates**: WebSocket integration
6. **Advanced Sorting**: Multiple column sorting options

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd datasette-chart

# Install dependencies
npm install

# Update Chart.js
npm run update-chartjs
```

### Testing

```bash
# Run tests
python -m pytest tests/
```

### Building

```bash
# Build for production
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Note**: This plugin requires Datasette and Chart.js to function properly. Ensure all dependencies are installed and configured correctly.
