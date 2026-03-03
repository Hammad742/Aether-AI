
export const extractTextFromPDF = async (file) => {
    try {
        // Dynamically import from CDN to avoid npm install and Vite resolution issues
        const pdfjsLib = await import(/* @vite-ignore */ 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.min.mjs');

        // Ensure the worker is configured
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        const numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');

            fullText += `--- Page ${i} ---\n${pageText}\n\n`;

            if (fullText.length > 30000) {
                fullText += `\n... [Content truncated at ~30k characters to respect API limits] ...`;
                break;
            }
        }

        return fullText;
    } catch (error) {
        console.error("Error extracting PDF text:", error);
        throw new Error("Failed to parse PDF document.");
    }
};
