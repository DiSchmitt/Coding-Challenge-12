let originalData = []; // Define originalData in a broader scope

// Function to parse CSV data
function parseCSV(csvData) {
    Papa.parse(csvData, {
        header: true,
        complete: function(results) {
            originalData = results.data; // Store parsed data in originalData
            displayData(originalData);
            populateStockNameFilter(originalData);
            populateDateFilter(originalData); // Populate date filter dropdown
            populatePriceFilter(originalData); // Populate price filter dropdown
        }
    });
}

// Function to display data in the table
function displayData(data) {
    const tableBody = document.querySelector('#stockData tbody');
    tableBody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.Stock}</td>
            <td>${row.Date}</td>
            <td>${row.Price}</td>
        `;
        tableBody.appendChild(tr);
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

    // Populate with unique stock names
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

    // Populate with unique dates
    const dates = new Set(data.map(item => item.Date));
    dates.forEach(date => {
        const option = document.createElement('option');
        option.textContent = date;
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

    // Populate with unique prices
    const prices = new Set(data.map(item => item.Price));
    prices.forEach(price => {
        const option = document.createElement('option');
        option.textContent = price;
        priceFilter.appendChild(option);
    });
}

// Function to apply filters based on user selection
function applyFilters() {
    const stockName = document.querySelector('#stockNameFilter').value;
    const selectedDate = document.querySelector('#dateFilter').value.trim(); // Get selected date from filter dropdown
    const selectedPrice = document.querySelector('#priceFilter').value.trim(); // Get selected price from filter dropdown

    // Perform filtering based on selected criteria
    const filteredData = originalData.filter(row => {
        let match = true;

        // Filter by stock name
        if (stockName && (row.Stock === undefined || row.Stock.trim() !== stockName)) {
            match = false;
        }

        // Filter by selected date
        if (selectedDate && row.Date !== selectedDate) {
            match = false;
        }

        // Filter by selected price
        if (selectedPrice && row.Price !== selectedPrice) {
            match = false;
        }

        return match;
    });

    // Display filtered data
    displayData(filteredData);
}

// Function to fetch CSV file from URL
function fetchCSVFile(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(parseCSV)
        .catch(error => console.error('Error fetching CSV:', error));
}

// Usage: Fetch CSV file from HTTP link
const csvUrl = 'https://raw.githubusercontent.com/DiSchmitt/Coding-Challenge-12/main/mock_stock_data.csv';
fetchCSVFile(csvUrl);