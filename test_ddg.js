const https = require('https');

https.get('https://html.duckduckgo.com/html/?q=ramadan+2026', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            // Find all class names that start with "result"
            const matches = rawData.match(/class="[^"]*result[^"]*"/g);
            if (matches) {
                const uniqueClasses = [...new Set(matches)];
                console.log("Found result-related classes snippet:");
                console.log(uniqueClasses.join('\n'));

                // Print a snippet of an actual result block
                const resultBlock = rawData.substring(rawData.indexOf('class="result '), rawData.indexOf('class="result ') + 1000);
                console.log("\nSample HTML block:");
                console.log(resultBlock);
            } else {
                console.log("No result classes found.");
                console.log("Raw HTML Preview:", rawData.substring(0, 500));
            }
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
