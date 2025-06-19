# Datasette Chart Plugin

[cite_start]The Datasette Chart Plugin is a custom plugin that extends Datasette's capabilities by enabling interactive data visualizations directly on your table and query pages[cite: 1]. [cite_start]This plugin leverages the Chart.js library to allow users to define and display various types of charts (bar, line, scatter) through simple parameter configuration in their `metadata.yaml` file[cite: 2]. [cite_start]This eliminates the need for writing custom HTML or JavaScript for each visualization, providing a seamless way to add visual insights to your tabular data[cite: 3]. [cite_start]Chart.js was chosen for its popularity, community support, and ease of implementation[cite: 4, 5].

## Features

- [cite_start]**Configurable Charts**: Define chart types, titles, and data columns directly within Datasette's `metadata.yaml`[cite: 6].
- [cite_start]**Flexible Scope**: Apply configurations globally, per database, per table, or even for specific canned queries[cite: 7, 8].
- [cite_start]**Automatic Data Fetching**: The plugin automatically fetches the necessary data from Datasette's JSON API to render the charts[cite: 9].
- [cite_start]**Multiple Chart Types**: Supports bar, line, and scatter charts[cite: 10].
- [cite_start]**Responsive Design**: Charts are designed to be responsive and adapt to different screen sizes[cite: 10].
- [cite_start]**Error Handling**: Provides console debug messages if data columns are missing or if no chart data is available[cite: 11].

## Installation

To install and use the Datasette Chart Plugin, follow these steps:

1.  **Clone the repository and navigate into it**:

    ```bash
    git clone git@github.com:r-curio/datasette-chart.git
    cd datasette-chart
    ```

2.  **Install dependencies and the plugin**:

    ```bash
    npm install
    npm run update-chartjs
    pip install -e
    ```

3.  **Run Datasette with the plugin**:

    ```bash
    datasette run my_database.db -m my_metadata
    ```

    [cite_start]_Note: Replace `my_database.db` with the name of your SQLite database file and `my_metadata` with your metadata file._ [cite: 12]

## Configuration

[cite_start]The Datasette Chart Plugin is configured via Datasette's `metadata.yaml` file[cite: 13]. [cite_start]Chart settings can be defined at a global level, for specific databases/tables, or for individual canned queries[cite: 14]. [cite_start]The plugin merges configurations in the following order of precedence (later overrides earlier)[cite: 15]:

1.  Global `plugins.datasette-chart`
2.  Database-specific `databases.<db_name>.plugins.datasette-chart`
3.  Table-specific `databases.<db_name>.tables.<table_name>.plugins.datasette-chart`
4.  [cite_start]Query-specific `databases.<db_name>.queries.<query_name>.plugins.datasette-chart` [cite: 15, 16]

### Global Configuration

[cite_start]Applies to all tables and queries if no more specific configuration is provided[cite: 16].

```yaml
# metadata.yaml
plugins:
  datasette-chart:
    label_column: # required
    data_column: # required
    chart_type: # required
    chart_title: # optional
```

### Table-Specific Configuration

[cite_start]Overrides global settings for a particular table[cite: 17].

```yaml
#metadata.yaml
databases:
  spotify:
    tables:
      spotify_tracks:
        plugins:
          datasette-chart:
            label_column: # required
            data_column: # required
            chart_type: # required
            chart_title: "My Spotify Tracks Chart" # optional
```

### Query-Specific Configuration

[cite_start]Overrides all other settings for a specific canned query, useful for visualizing custom SQL query results[cite: 17].

```yaml
#metadata.yaml
databases:
  db_name:
    queries:
      query_name:
        plugins:
          datasette-chart:
            chart_title: # optional
            label_column: # required
            data_column: # required
            chart_type: # required
```

### Configuration Parameters

[cite_start]The `datasette-chart` plugin accepts the following parameters[cite: 18]:

- [cite_start]`label_column` (string, **required**): The name of the column to use for the chart's labels (X-axis for bar/line, or as an identifier for scatter)[cite: 18].
- [cite_start]`data_column` (string, **required**): The name of the column to use for the chart's data values (Y-axis for bar/line, or Y-coordinate for scatter)[cite: 19].
- `chart_type` (string, **required**): The type of chart to display. [cite_start]Supported values[cite: 20]:
  - [cite_start]`"bar"`: Displays a bar chart[cite: 21].
  - `"line"`: Displays a line chart. [cite_start]Requires `label_column` to be sortable (e.g., dates/numbers) for proper chronological display[cite: 21].
  - `"scatter"`: Displays a scatter plot. [cite_start]`label_column` will be used for the X-coordinate and `data_column` for the Y-coordinate[cite: 22].
- `chart_title` (string, optional): The title to display above the chart. [cite_start]Defaults to "Table Data Chart" or "Table Data Visualization"[cite: 23].

## Usage

[cite_start]Once configured in `metadata.yaml` and Datasette is running with the plugin enabled, simply navigate to the relevant table or canned query page in your web browser[cite: 24]. [cite_start]The chart will automatically appear at the top of the content area, above the table or query results[cite: 25].

- [cite_start]**Bar Charts**: Ideal for comparing discrete categories[cite: 26].
- [cite_start]**Line Charts**: Best for showing trends over time or ordered data[cite: 26].
- [cite_start]**Scatter Plots**: Useful for visualizing the relationship between two numerical variables[cite: 27].

## Troubleshooting

### Chart Not Appearing:

- [cite_start]**Check Datasette Console**: Ensure Datasette is running without errors in your terminal[cite: 44].
- **Browser Console**: Open your browser's developer console (F12) and check for any JavaScript errors. [cite_start]Look for messages from `console.log('Plugin config loaded...')` to verify the configuration is being passed[cite: 45].
- **`metadata.yaml` Syntax**: YAML is strict about indentation. Ensure your `metadata.yaml` is correctly formatted. [cite_start]Use a YAML linter if unsure[cite: 46, 47].
- [cite_start]**Plugin Path**: Double-check that `--plugin-dir=./datasette_chart` is correct relative to where you are running Datasette[cite: 48].
- [cite_start]**Column Names**: Verify that `label_column` and `data_column` in your `metadata.yaml` exactly match the column names in your database table/query results (case-sensitive)[cite: 49].
- [cite_start]**`chart.min.js` Location**: Ensure `datasette_chart/static/chart.min.js` exists and is accessible[cite: 49].

### "Column 'X' not found in table" Error:

- [cite_start]This means the `label_column` or `data_column` you specified in `metadata.yaml` does not exist in the data returned by Datasette for that particular table or query[cite: 50]. [cite_start]Review your `metadata.yaml` and your database schema/query[cite: 51].

### Chart Displays Incorrect Data or Format:

- [cite_start]**Data Types**: Ensure the data in your specified columns is appropriate for the chosen chart type (e.g., numbers for `data_column`, or valid dates for line chart `label_column`)[cite: 52].
- [cite_start]**JSON API Data**: Inspect the JSON output from Datasette's API directly (e.g., navigate to `http://localhost:8001/database_name/table_name.json?_shape=objects`) to see the exact structure and values the plugin is receiving[cite: 52].
