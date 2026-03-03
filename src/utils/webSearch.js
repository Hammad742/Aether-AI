/**
 * Utility to perform free web searches directly from the browser by routing
 * a search engine's HTML endpoint through a public CORS proxy, then parsing
 * the results back into plain text.
 */
export const performWebSearch = async (query) => {
    try {
        const encodedQuery = encodeURIComponent(query);
        // Route DuckDuckGo traffic safely through our local Vite proxy to avoid CORS
        const searchUrl = `/ddg-api/html/?q=${encodedQuery}`;

        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`Proxy responded with status ${response.status}`);
        }

        const htmlHtml = await response.text();

        // Parse the HTML returned by DuckDuckGo
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlHtml, 'text/html');

        // Extract the result snippets
        const resultElements = doc.querySelectorAll('.result__body');
        const results = [];

        resultElements.forEach((el, index) => {
            if (index >= 3) return; // Limit to top 3 results to save context window tokens

            const titleEl = el.querySelector('.result__title');
            const snippetEl = el.querySelector('.result__snippet');
            const urlEl = el.querySelector('.result__a');

            const title = titleEl ? titleEl.textContent.trim() : 'No title';
            const snippet = snippetEl ? snippetEl.textContent.trim() : 'No description available';
            const url = urlEl ? urlEl.getAttribute('href') : '';

            // Clean up URLs that go through DDG redirect
            let cleanUrl = url;
            if (cleanUrl && cleanUrl.startsWith('//duckduckgo.com/l/?uddg=')) {
                cleanUrl = decodeURIComponent(cleanUrl.split('uddg=')[1].split('&')[0]);
            }

            if (title && snippet) {
                results.push(`[${title}](${cleanUrl})\n${snippet}`);
            }
        });

        if (results.length === 0) {
            return "No web search results found for this query.";
        }

        return `Web Search Results Context:\n\n` + results.join("\n\n---\n\n");
    } catch (error) {
        console.error("Web Search Integration Error: ", error);
        return `[System Note: Web Search failed. Proceed without internet context. Error: ${error.message}]`;
    }
};
