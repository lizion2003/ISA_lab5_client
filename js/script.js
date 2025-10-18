/**
 * SQL Query Interface - Client Side Script
 */

document.addEventListener('DOMContentLoaded', function() {
    const sqlQuery = document.getElementById('sqlQuery');
    const submitBtn = document.getElementById('submitBtn');
    const insertBtn = document.getElementById('insertBtn');
    const resultsDiv = document.getElementById('results');

    /**
     * Handles the Insert button POST request
     */
    insertBtn.addEventListener('click', async function() {
        // Show loading state
        insertBtn.disabled = true;
        insertBtn.textContent = 'Inserting...';
        showLoading();

        try {
            const endpoint = 'https://comp4537-lab5-iota.vercel.app/api/v1/sql/';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    query: "INSERT INTO patient (firstName,lastName,healthNum,age,notes) VALUES ('Sara','Brown','H10001','30','abc'), ('John','Smith','H10001','30','abc'), ('Jack','Ma','H10001','30','abc'), ('Elon','Musk','H10001','30','abc')"
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Insert operation failed');
            }

            // Display results
            showResults(data, 'Insert');

        } catch (error) {
            showError(error.message);
        } finally {
            // Reset button state
            insertBtn.disabled = false;
            insertBtn.textContent = 'Insert';
        }
    });

    /**
     * Handles the SQL query submission
     */
    submitBtn.addEventListener('click', async function() {
        const query = sqlQuery.value.trim();

        // Validate input
        if (!query) {
            showError('Please enter a SQL query');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Executing...';
        showLoading();

        try {
            // TODO: Replace with your actual API endpoint
            const endpoint = '/api/query';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Query execution failed');
            }

            // Display results
            showResults(data);

        } catch (error) {
            showError(error.message);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Query';
        }
    });

    /**
     * Displays query results
     */
    function showResults(data, operation = 'Query') {
        resultsDiv.className = 'results-section show';
        resultsDiv.innerHTML = `
            <h2>${operation} Results</h2>
            <div class="success">
                <strong>Success!</strong> ${operation} executed successfully.
            </div>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    }

    /**
     * Displays error message
     */
    function showError(message) {
        resultsDiv.className = 'results-section show';
        resultsDiv.innerHTML = `
            <h2>Error</h2>
            <div class="error">
                <strong>Error:</strong> ${escapeHtml(message)}
            </div>
        `;
    }

    /**
     * Shows loading state
     */
    function showLoading() {
        resultsDiv.className = 'results-section show';
        resultsDiv.innerHTML = `
            <h2>Executing Query...</h2>
            <p>Please wait while your query is being processed.</p>
        `;
    }

    /**
     * Escapes HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }


});
