// Function to parse CSV data using PapaParse
function parseCSV(url) {
    return new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  
  // Function to populate stock name filter dropdown
  function populateStockNameFilter(data) {
    const stockNameFilter = document.querySelector('#stockNameFilter');
    stockNameFilter.innerHTML = ''; // Clear previous options (if any)
  
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Select Stock Name';
    defaultOption.value = '';
    stockNameFilter.appendChild(defaultOption);
  
    // Populate with unique and defined stock names
    const stockNames = new Set(data.map(item => item.Stock && item.Stock.trim()).filter(Boolean));
    stockNames.forEach(name => {
      const option = document.createElement('option');
      option.textContent = name;
      stockNameFilter.appendChild(option);
    });
  }
  
  // Function to populate date filter dropdown
  function populateDateFilter(data) {
    const dateFilter = document.querySelector('#dateFilter');
    dateFilter.innerHTML = ''; // Clear previous options (if any)
  
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Select Date';
    defaultOption.value = '';
    dateFilter.appendChild(defaultOption);
  
    // Populate with unique and defined dates
    const dates = [...new Set(data.map(item => item.Date))];
    dates.forEach(date => {
      const option = document.createElement('option');
      option.textContent = date;
      option.value = date;
      dateFilter.appendChild(option);
    });
  }
  
  // Function to populate price filter dropdown
  function populatePriceFilter(data) {
    const priceFilter = document.querySelector('#priceFilter');
    priceFilter.innerHTML = ''; // Clear previous options (if any)
  
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Select Price';
    defaultOption.value = '';
    priceFilter.appendChild(defaultOption);
  
    // Populate with unique and defined prices
    const prices = new Set(data.map(item => item.Price));
    prices.forEach(price => {
      const option = document.createElement('option');
      option.textContent = price;
      priceFilter.appendChild(option);
    });
  }
  
  // Function to display data in the line chart
function displayLineChart(data) {
    const svg = d3.select('#chart');
    const width = 600; // Set SVG width
    const height = 600; // Set SVG height
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
  
    svg.attr('width', width)
       .attr('height', height);
  
    // Filter data for each stock name
    const stockNames = [...new Set(data.map(item => item.Stock))];
    const stockData = stockNames.map(stock => {
      return {
        name: stock,
        values: data.filter(item => item.Stock === stock)
      };
    });
  
    const parseDate = d3.timeParse('%Y-%m-%d'); // Parse dates from string format
    const formatDate = d3.timeFormat('%b %d'); // Format dates in abbreviated form (e.g., Jan 2)
  
    // Extract unique dates and sort them
    const uniqueDates = [...new Set(data.map(item => item.Date))].sort((a, b) => new Date(a) - new Date(b));
  
    const x = d3.scaleBand()
      .domain(uniqueDates)
      .range([0, innerWidth]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Price)])
      .range([innerHeight, 0]);
  
    const color = d3.scaleOrdinal(d3.schemeCategory10);
  
    // Define the line generator
    const line = d3.line()
      .x(d => x(d.Date) + x.bandwidth() / 2) // Adjusted to center line on date band
      .y(d => y(d.Price));
  
    svg.selectAll('*').remove(); // Clear previous chart elements
  
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    g.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => formatDate(parseDate(d)))); // Format ticks as abbreviated dates
  
    g.append('g')
      .attr('class', 'axis axis-y')
      .call(d3.axisLeft(y));
  
    // Draw lines for each stock data
    const stockLines = g.selectAll('.stock-line')
      .data(stockData)
      .enter().append('g')
        .attr('class', 'stock-line');
  
    stockLines.append('path')
      .attr('class', 'line')
      .attr('d', d => line(d.values))
      .style('stroke', d => color(d.name))
      .style('fill', 'none');
  
    // Add circles for each data point
    stockLines.selectAll('.circle')
      .data(d => d.values)
      .enter().append('circle')
        .attr('class', 'circle')
        .attr('cx', d => x(d.Date) + x.bandwidth() / 2) // Adjust circle position to align with band scale
        .attr('cy', d => y(d.Price))
        .attr('r', 4)
        .style('fill', 'white')
        .style('stroke', d => color(d.Stock));
  
    // Text label for each stock line
    stockLines.append('text')
      .datum(d => ({ name: d.name, value: d.values[d.values.length - 1] }))
      .attr('transform', d => `translate(${x(d.value.Date) + x.bandwidth() / 2},${y(d.value.Price)})`)
      .attr('x', 3)
      .attr('dy', '0.35em')
      .style('font', '10px sans-serif')
      .text(d => d.name);
  }
  
  // Function to apply filters based on user selection
  function applyFilters() {
    const stockName = document.querySelector('#stockNameFilter').value;
    const selectedDate = document.querySelector('#dateFilter').value.trim(); // Get selected date from filter dropdown
    const selectedPrice = document.querySelector('#priceFilter').value.trim(); // Get selected price from filter dropdown
  
    // Perform filtering based on selected criteria
    let filteredData = originalData;
  
    if (stockName) {
      filteredData = filteredData.filter(row => row.Stock && row.Stock.trim() === stockName);
    }
  
    if (selectedDate) {
      filteredData = filteredData.filter(row => row.Date && row.Date.trim() === selectedDate);
    }
  
    if (selectedPrice) {
      filteredData = filteredData.filter(row => row.Price && row.Price.toString() === selectedPrice);
    }
  
    // Display filtered data in line chart
    displayLineChart(filteredData);
  }
  
  // Fetch and parse CSV data
  const csvUrl = 'https://raw.githubusercontent.com/DiSchmitt/Coding-Challenge-12/main/mock_stock_data.csv';
  
  parseCSV(csvUrl)
    .then(data => {
      // Save original data for filtering
      originalData = data;
  
      // Populate filter dropdowns
      populateStockNameFilter(data);
      populateDateFilter(data);
      populatePriceFilter(data);
  
      // Display initial data in line chart
      displayLineChart(data);
    })
    .catch(error => {
      console.error('Error parsing CSV:', error);
    });
  
  // Event listener for filter button
  document.querySelector('#filterBtn').addEventListener('click', applyFilters);