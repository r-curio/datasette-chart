document.addEventListener("DOMContentLoaded", function () {
  const pluginConfig = window.chartPluginConfig || {};
  console.log("Chart Plugin Configuration:", pluginConfig);

  const chartContainer = document.createElement("div");
  chartContainer.id = "chart-container";
  chartContainer.style.cssText =
    "background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0; max-width: 800px;";

  const title = document.createElement("h3");
  title.textContent = pluginConfig.chart_title || "Table Data Chart";
  title.style.cssText = "margin: 0 0 20px 0; color: #333; text-align: center;";
  chartContainer.appendChild(title);

  const canvas = document.createElement("canvas");
  canvas.id = "myChart";
  canvas.style.cssText =
    "max-width: 100%; max-height: 300px; width: 100%; height: 300px;";
  chartContainer.appendChild(canvas);

  // Find the table element
  const tableElement =
    document.querySelector("table") ||
    document.querySelector(".table-container") ||
    document.querySelector("[data-table]");

  if (tableElement) {
    tableElement.parentNode.insertBefore(chartContainer, tableElement);
  } else {
    document.body.appendChild(chartContainer);
  }

  async function fetchTableData() {
    try {
      // Get current URL path to determine database and table
      const pathParts = window.location.pathname
        .split("/")
        .filter((part) => part);
      const database = pathParts[0];
      const table = pathParts[1];

      if (!database || !table) {
        return null;
      }

      // Construct the JSON API URL
      const jsonUrl = `/${database}/${table}.json?_shape=objects&_size=100`;
      console.log("Fetching data from:", jsonUrl);

      const response = await fetch(jsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching table data:", error);
      return null;
    }
  }

  function processDataForChart(data) {
    if (!data || !data.rows || data.rows.length === 0) {
      return null;
    }

    const rows = data.rows;
    const columns = data.columns;

    // Use configuration from metadata if available, otherwise use defaults
    const labelColumn = pluginConfig.label_column || "song";
    const dataColumn = pluginConfig.data_column || "popularity";

    console.log("Using columns from config:", { labelColumn, dataColumn });

    // Check if required columns exist
    if (!columns.includes(labelColumn)) {
      console.log(`Column '${labelColumn}' not found in table`);
      return null;
    }

    if (!columns.includes(dataColumn)) {
      console.log(`Column '${dataColumn}' not found in table`);
      return null;
    }

    // Extract labels and data from provided columns
    const labels = rows.map((row) => String(row[labelColumn]).substring(0, 20));
    const dataValues = rows.map((row) => {
      const value = row[dataColumn];
      return value;
    });

    if (pluginConfig.chart_type === "scatter") {
      // create x,y coordinate pairs
      const scatterData = labels.map((label, index) => ({
        x: parseFloat(label) || index,
        y: parseFloat(dataValues[index]) || 0,
      }));

      return {
        labels: [],
        datasets: [
          {
            label: dataColumn.charAt(0).toUpperCase() + dataColumn.slice(1),
            data: scatterData,
          },
        ],
      };
    } else if (pluginConfig.chart_type === "line") {
      // sort by date and use labels on x-axis and values on y-axis
      const sortedRows = [...rows].sort((a, b) => {
        const dateA = new Date(a[labelColumn]);
        const dateB = new Date(b[labelColumn]);
        return dateA - dateB;
      });

      const sortedLabels = sortedRows.map((row) =>
        String(row[labelColumn]).substring(0, 20)
      );
      const sortedDataValues = sortedRows.map((row) => {
        const value = row[dataColumn];
        return value;
      });

      return {
        labels: sortedLabels,
        datasets: [
          {
            label: dataColumn.charAt(0).toUpperCase() + dataColumn.slice(1),
            data: sortedDataValues,
            tension: 0.2,
          },
        ],
      };
    } else {
      // create separate datasets for each label
      const datasets = labels.map((label, index) => ({
        label: label,
        data: [dataValues[index]],
      }));

      return {
        labels: [dataColumn.charAt(0).toUpperCase() + dataColumn.slice(1)],
        datasets: datasets,
      };
    }
  }

  async function createChart() {
    const tableData = await fetchTableData();
    const chartData = processDataForChart(tableData);

    if (!chartData) {
      console.log("No chart data available - hiding chart container");
      chartContainer.style.display = "none";
      return;
    }

    chartContainer.style.display = "block";

    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: pluginConfig.chart_type || "bar",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: pluginConfig.chart_title || "Table Data Visualization",
          },
          legend: {
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  createChart();
});
