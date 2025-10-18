/**
 * SQL Query Interface - Client Side Script (OOP Version)
 */

/**
 * Utility class for common helper functions
 */
class Utils {
    /**
     * Escapes HTML to prevent XSS attacks
     * @param {string} text - The text to escape
     * @returns {string} HTML-safe string
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * Class to handle API requests to the SQL server
 */
class SQLApiClient {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    /**
     * Executes a SELECT query using GET request
     * @param {string} query - The SQL SELECT query
     * @returns {Promise<Object>} API response data
     */
    async executeSelect(query) {
        const encodedQuery = encodeURIComponent(query);
        const url = this.endpoint + encodedQuery;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Query execution failed');
        }

        return data;
    }

    /**
     * Executes an INSERT query using POST request
     * @param {string} query - The SQL INSERT query
     * @returns {Promise<Object>} API response data
     */
    async executeInsert(query) {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: query })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Insert operation failed');
        }

        return data;
    }
}

/**
 * Class to handle UI display and updates
 */
class UIManager {
    constructor(resultsDiv) {
        this.resultsDiv = resultsDiv;
    }

    /**
     * Displays query results
     * @param {Object} data - The data to display
     * @param {string} operation - The operation type (e.g., 'Query', 'Insert')
     */
    showResults(data, operation = 'Query') {
        this.resultsDiv.className = 'results-section show';
        this.resultsDiv.innerHTML = `
            <h2>${operation} Results</h2>
            <div class="success">
                <strong>Success!</strong> ${operation} executed successfully.
            </div>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    }

    /**
     * Displays error message
     * @param {string} message - The error message to display
     */
    showError(message) {
        this.resultsDiv.className = 'results-section show';
        this.resultsDiv.innerHTML = `
            <h2>Error</h2>
            <div class="error">
                <strong>Error:</strong> ${Utils.escapeHtml(message)}
            </div>
        `;
    }

    /**
     * Shows loading state
     */
    showLoading() {
        this.resultsDiv.className = 'results-section show';
        this.resultsDiv.innerHTML = `
            <h2>Executing Query...</h2>
            <p>Please wait while your query is being processed.</p>
        `;
    }
}

/**
 * Class to handle query validation
 */
class QueryValidator {
    /**
     * Validates if query is not empty
     * @param {string} query - The query to validate
     * @returns {boolean} True if valid
     */
    static isNotEmpty(query) {
        return query && query.trim().length > 0;
    }

    /**
     * Validates if query is SELECT or INSERT
     * @param {string} query - The query to validate
     * @returns {boolean} True if valid
     */
    static isAllowedType(query) {
        const upperQuery = query.toUpperCase();
        return upperQuery.startsWith('SELECT') || upperQuery.startsWith('INSERT');
    }

    /**
     * Gets the query type
     * @param {string} query - The query to check
     * @returns {string} 'SELECT' or 'INSERT'
     */
    static getQueryType(query) {
        const upperQuery = query.toUpperCase();
        return upperQuery.startsWith('SELECT') ? 'SELECT' : 'INSERT';
    }
}

/**
 * Class to handle Insert button functionality
 */
class InsertButtonHandler {
    constructor(button, apiClient, uiManager) {
        this.button = button;
        this.apiClient = apiClient;
        this.uiManager = uiManager;
        this.hardcodedQuery = `INSERT INTO patient (name,date_of_birth) 
            VALUES 
                ('Sara Brown','1901-01-01'), 
                ('John Smith','1941-01-01'), 
                ('Jack Ma','1961-01-30'), 
                ('Elon Musk','1999-01-01')`;
        this.init();
    }

    /**
     * Initialize event listener
     */
    init() {
        this.button.addEventListener('click', () => this.handleClick());
    }

    /**
     * Handles button click event
     */
    async handleClick() {
        this.setLoadingState(true);
        this.uiManager.showLoading();

        try {
            const data = await this.apiClient.executeInsert(this.hardcodedQuery);
            this.uiManager.showResults(data, 'Insert');
        } catch (error) {
            this.uiManager.showError(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Sets button loading state
     * @param {boolean} isLoading - Whether button is in loading state
     */
    setLoadingState(isLoading) {
        this.button.disabled = isLoading;
        this.button.textContent = isLoading ? 'Inserting...' : 'Insert';
    }
}

/**
 * Class to handle Submit Query button functionality
 */
class SubmitButtonHandler {
    constructor(button, queryInput, apiClient, uiManager) {
        this.button = button;
        this.queryInput = queryInput;
        this.apiClient = apiClient;
        this.uiManager = uiManager;
        this.init();
    }

    /**
     * Initialize event listener
     */
    init() {
        this.button.addEventListener('click', () => this.handleClick());
    }

    /**
     * Handles button click event
     */
    async handleClick() {
        const query = this.queryInput.value.trim();

        // Validate input
        if (!QueryValidator.isNotEmpty(query)) {
            this.uiManager.showError('Please enter a SQL query');
            return;
        }

        if (!QueryValidator.isAllowedType(query)) {
            this.uiManager.showError('Only SELECT or INSERT queries are allowed');
            return;
        }

        this.setLoadingState(true);
        this.uiManager.showLoading();

        try {
            const queryType = QueryValidator.getQueryType(query);
            let data;

            if (queryType === 'SELECT') {
                data = await this.apiClient.executeSelect(query);
            } else {
                data = await this.apiClient.executeInsert(query);
            }

            this.uiManager.showResults(data);
        } catch (error) {
            this.uiManager.showError(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Sets button loading state
     * @param {boolean} isLoading - Whether button is in loading state
     */
    setLoadingState(isLoading) {
        this.button.disabled = isLoading;
        this.button.textContent = isLoading ? 'Executing...' : 'Submit Query';
    }
}

/**
 * Main Application class
 */
class SQLQueryApp {
    constructor() {
        this.API_ENDPOINT = 'https://comp4537-lab5-iota.vercel.app/api/v1/sql/';
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        // Get DOM elements
        const sqlQuery = document.getElementById('sqlQuery');
        const submitBtn = document.getElementById('submitBtn');
        const insertBtn = document.getElementById('insertBtn');
        const resultsDiv = document.getElementById('results');

        // Initialize instances
        const apiClient = new SQLApiClient(this.API_ENDPOINT);
        const uiManager = new UIManager(resultsDiv);

        // Initialize button handlers
        new InsertButtonHandler(insertBtn, apiClient, uiManager);
        new SubmitButtonHandler(submitBtn, sqlQuery, apiClient, uiManager);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SQLQueryApp();
});
