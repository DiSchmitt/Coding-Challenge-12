// Global variables to store data and filtered data
let data = [];
let filteredData = [];

// Load and parse CSV data
d3.csv('https://raw.githubusercontent.com/DiSchmitt/Coding-Challenge-12/main/mock_stock_data.csv').then(function(csvData) {
    // Parse dates and values as numbers
    csvData.forEach(function(d) {
        d.Date = new Date(d.Date); // Parse date string to Date object
        d.Price = +d.Price; // Convert Price to number
        d.stock = d.Stock; // Rename 'Stock' to 'stock' to match your data structure
        delete d.Stock; // Remove the original 'Stock' field if not needed
    });

    data = csvData; // Store parsed data globally
    filteredData = data; // Initially set filteredData to all data

    // Populate stock select dropdown with default option
    const stockSelect = d3.select("#stockSelect");
    stockSelect.append("option")
        .attr("value", "All")
        .text("All Stocks"); // Default option to show all stocks

    // Get unique stocks and populate dropdown
    const stocks = Array.from(new Set(data.map(d => d.stock)));
    stocks.forEach(stock => {
        stockSelect.append("option")
            .attr("value", stock)
            .text(stock);
    });

    renderChart(filteredData); // Initial rendering with all data
}).catch(function(error) {
    console.log('Error loading the CSV file: ', error);
});

// Create tooltip element
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    function renderChart(data) {
        // Clear previous chart if exists
        d3.select("#chart").selectAll("*").remove();
    
        // Define dimensions and margins
        const margin = { top: 20, right: 30, bottom: 50, left: 60 };
        const width = 600 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;
    
        // Create SVG element
        const svg = d3.select("#chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
        // Apply CSS styles from external file
        svg.attr("class", "chart-svg"); // Apply class for SVG container
        svg.style("font", "10px sans-serif"); // Apply font style if not overridden by CSS
    
        // Get selected stock from dropdown
        const selectedStock = d3.select("#stockSelect").property("value");
    
        // Filter data based on selected stock
        let filteredData;
        if (selectedStock === "All") {
            filteredData = data; // Show all stocks
        } else {
            filteredData = data.filter(d => d.stock === selectedStock); // Filter by selected stock
        }
    
        // Group filtered data by stock
        const nestedData = d3.group(filteredData, d => d.stock);
    
        // Color scale for lines
        const color = "steelblue"; // Default color if not overridden by CSS
    
        // Scales and axes
        const xScale = d3.scaleTime()
            .domain(d3.extent(filteredData, d => d.Date))
            .range([0, width]);
    
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.Price)])
            .nice()
            .range([height, 0]);
    
        const xAxis = d3.axisBottom(xScale)
            .tickSize(0) // Remove ticks
            .tickFormat(""); // Remove tick labels
    
        const yAxis = d3.axisLeft(yScale)
            .ticks(5); // Example: Setting the number of ticks on y-axis
    
        // Add axes
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);
    
        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);
    
        // Line generator
        const line = d3.line()
            .x(d => xScale(d.Date))
            .y(d => yScale(d.Price));
    
        // Draw lines
        svg.selectAll(".line")
            .data(nestedData)
            .enter().append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", color) // Set stroke color to default color
            .attr("stroke-width", 2)
            .attr("d", d => line(Array.from(d[1]))); // d[1] contains array of values for each stock
    
        // Add data points
        svg.selectAll(".dot")
            .data(filteredData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.Date))
            .attr("cy", d => yScale(d.Price))
            .attr("r", 5)
            .attr("fill", color) // Set data point fill color to default color
            .on("mouseover", function(event, d) {
                // Show tooltip on mouseover
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`<strong>Stock:</strong> ${d.stock}<br><strong>Date:</strong> ${d.Date.toLocaleDateString()}<br><strong>Price:</strong> ${d.Price}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                // Hide tooltip on mouseout
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    
        // Populate stock select dropdown with default and unique options
        const stockSelect = d3.select("#stockSelect");
        stockSelect.selectAll("option").remove(); // Clear existing options
    
        // Add default "All" option
        stockSelect.append("option")
            .attr("value", "All")
            .text("All Stocks");
    
        // Add specific options (Apple and Google)
        stockSelect.append("option")
            .attr("value", "Apple")
            .text("Apple");
    
        stockSelect.append("option")
            .attr("value", "Google")
            .text("Google");
    
        // Set selected option in dropdown based on filtered data
        stockSelect.property("value", selectedStock);
    
        // Event listener for stock selection change
        stockSelect.on("change", function() {
            renderChart(data); // Render chart with filtered data on stock selection change
        });
    }    