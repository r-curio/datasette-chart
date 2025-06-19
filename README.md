# Datasette Chart Plugin

A custom Datasette plugin that extends Datasette's capabilities by enabling interactive data visualizations directly on your table and query pages. This plugin leverages the Chart.js library to allow users to define and display various types of charts (bar, line, scatter) through simple parameter configuration in their `metadata.yaml` file. This eliminates the need for writing custom HTML or JavaScript for each visualization, providing a seamless way to add visual insights to your tabular data.

## Features

- **Configurable Charts**: Define chart types, titles, and data columns directly within Datasette's `metadata.yaml`
- **Flexible Scope**: Apply configurations globally, per database, per table, or even for specific canned queries
- **Automatic Data Fetching**: The plugin automatically fetches the necessary data from Datasette's JSON API to render the charts
- **Multiple Chart Types**: Supports bar, line, and scatter charts
- **Responsive Design**: Charts are designed to be responsive and adapt to different screen sizes
- **Error Handling**: Provides console debug messages if data columns are missing or if no chart data is available

## Installation

To install and use the Datasette Chart Plugin, follow these steps:

1. **Clone the repository and navigate into it**:

   ```bash
   git clone git@github.com:r-curio/datasette-chart.git
   cd datasette-chart
   ```

2. **Install dependencies and the plugin**:

   ```bash
   npm install
   npm run update-chartjs
   pip install -e .
   ```

3. **Run Datasette with the plugin**:

   ```bash
   datasette serve my_database.db --metadata my_metadata.yml
   ```

   _Note: Replace `my_database.db` with the name of your SQLite database file and `my_metadata.yml` with your metadata file._

## Configuration

The Datasette Chart Plugin is configured via Datasette's `metadata.yaml` file. Chart settings can be defined at a global level, for specific databases/tables, or for individual canned queries. The plugin merges configurations in the following order of precedence (later overrides earlier):

1. Global `plugins.datasette-chart`
2. Database-specific `databases.<db_name>.plugins.datasette-chart`
3. Table-specific `databases.<db_name>.tables.<table_name>.plugins.datasette-chart`
4. Query-specific `databases.<db_name>.queries.<query_name>.plugins.datasette-chart`

### Global Configuration

Applies to all tables and queries if no more specific configuration is provided.

```yaml
# metadata.yml
plugins:
  datasette-chart:
    label_column: "category" # required
    data_column: "value" # required
    chart_type: "bar" # required
    chart_title: "My Chart" # optional
```

### Table-Specific Configuration

Overrides global settings for a particular table.

```yaml
# metadata.yml
databases:
  spotify:
    tables:
      spotify_tracks:
        plugins:
          datasette-chart:
            label_column: "song" # required
            data_column: "popularity" # required
            chart_type: "bar" # required
            chart_title: "My Spotify Tracks Chart" # optional
```

### Query-Specific Configuration

Overrides all other settings for a specific canned query, useful for visualizing custom SQL query results.

```yaml
# metadata.yml
databases:
  db_name:
    queries:
      query_name:
        plugins:
          datasette-chart:
            chart_title: "Custom Query Chart" # optional
            label_column: "x_column" # required
            data_column: "y_column" # required
            chart_type: "scatter" # required
```

### Configuration Parameters

The `datasette-chart` plugin accepts the following parameters:

- `label_column` (string, **required**): The name of the column to use for the chart's labels (X-axis for bar/line, or as an identifier for scatter)
- `data_column` (string, **required**): The name of the column to use for the chart's data values (Y-axis for bar/line, or Y-coordinate for scatter)
- `chart_type` (string, **required**): The type of chart to display. Supported values:
  - `"bar"`: Displays a bar chart
  - `"line"`: Displays a line chart. Requires `label_column` to be sortable (e.g., dates/numbers) for proper chronological display
  - `"scatter"`: Displays a scatter plot. `label_column` will be used for the X-coordinate and `data_column` for the Y-coordinate
- `chart_title` (string, optional): The title to display above the chart. Defaults to "Table Data Chart" or "Table Data Visualization"

## Usage

Once configured in `metadata.yml` and Datasette is running with the plugin enabled, simply navigate to the relevant table or canned query page in your web browser. The chart will automatically appear at the top of the content area, above the table or query results.

- **Bar Charts**: Ideal for comparing discrete categories
- **Line Charts**: Best for showing trends over time or ordered data
- **Scatter Plots**: Useful for visualizing the relationship between two numerical variables

## Troubleshooting

### Chart Not Appearing

- **Check Datasette Console**: Ensure Datasette is running without errors in your terminal
- **Browser Console**: Open your browser's developer console (F12) and check for any JavaScript errors. Look for messages from `console.log('Plugin config loaded...')` to verify the configuration is being passed
- **`metadata.yml` Syntax**: YAML is strict about indentation. Ensure your `metadata.yml` is correctly formatted. Use a YAML linter if unsure
- **Plugin Path**: Double-check that the plugin is properly installed and accessible
- **Column Names**: Verify that `label_column` and `data_column` in your `metadata.yml` exactly match the column names in your database table/query results (case-sensitive)
- **Chart.js Files**: Ensure `datasette_chart/static/chart.min.js` exists and is accessible

### "Column 'X' not found in table" Error

This means the `label_column` or `data_column` you specified in `metadata.yml` does not exist in the data returned by Datasette for that particular table or query. Review your `metadata.yml` and your database schema/query.

### Chart Displays Incorrect Data or Format

- **Data Types**: Ensure the data in your specified columns is appropriate for the chosen chart type (e.g., numbers for `data_column`, or valid dates for line chart `label_column`)
- **JSON API Data**: Inspect the JSON output from Datasette's API directly (e.g., navigate to `http://localhost:8001/database_name/table_name.json?_shape=objects`) to see the exact structure and values the plugin is receiving

### Debug Mode

Enable debug mode to get more information:

```yaml
plugins:
  datasette-chart:
    debug_mode: true
    label_column: "your_column"
    data_column: "your_column"
```

This will show:

- Plugin configuration in browser console
- Data fetching URLs
- Column validation results
- Chart data processing steps

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
