// Configuration
export const CONFIG = {
    canvasWidth: 1025,
    canvasHeight: 1526,
    fontFamily: 'Arial, Helvetica, sans-serif',
    headerFontSize: 60,
    bodyFontSize: 24,
    lineHeight: 1.4,
    marginTop: 50,
    marginLeft: 50,
    bulletSize: 26,
    bulletColor: '#0079D3', // NS Blue style
    textColor: '#000000',
    bulletTextGap: 50, // Gap between bullet and text
    paragraphGap: 50, // Gap between paragraphs
};

// Helper to estimate text width (very rough estimation for non-browser env)
function estimateTextWidth(text: string, fontSize: number): number {
    // Average char width is often around 0.5-0.6 of em
    // We'll use a slightly conservative estimate
    const avgCharWidth = fontSize * 0.55;
    return text.length * avgCharWidth;
}

// Word wrapper
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = estimateTextWidth(currentLine + " " + word, fontSize);
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

/**
 * Generates an SVG string from a header and a list of bullet points.
 * @param header The title/header text.
 * @param items Array of bullet point strings.
 * @returns The complete SVG string.
 */
export interface GeneratorOptions {
    headerFontSize?: number;
    bodyFontSize?: number;
    maxLineWidth?: number;
}

/**
 * Generates an SVG string from a header and a list of bullet points.
 * @param header The title/header text.
 * @param items Array of bullet point strings.
 * @param options Optional configuration for font sizes.
 * @returns The complete SVG string.
 */
export function generateSVGString(header: string, items: string[], options?: GeneratorOptions): string {
    let svgContent = '';
    let currentY = CONFIG.marginTop;

    const headerFontSize = options?.headerFontSize || CONFIG.headerFontSize;
    const bodyFontSize = options?.bodyFontSize || CONFIG.bodyFontSize;

    // Default max line width is the canvas width minus margins if not specified
    const defaultMaxLineWidth = CONFIG.canvasWidth - (CONFIG.marginLeft * 2);
    const maxLineWidth = options?.maxLineWidth || defaultMaxLineWidth;

    // Use fixed canvas height from config
    // Use fixed canvas height from config (Removed for dynamic height)

    // Header
    const headerLines = wrapText(header, maxLineWidth, headerFontSize);

    svgContent += `<!-- Header -->\n`;
    svgContent += `<text x="${CONFIG.marginLeft}" y="${currentY}" font-family="${CONFIG.fontFamily}" font-size="${headerFontSize}" fill="${CONFIG.textColor}">\n`;

    headerLines.forEach((line, i) => {
        const dy = i === 0 ? 0 : (headerFontSize * CONFIG.lineHeight);
        if (i > 0) currentY += (headerFontSize * CONFIG.lineHeight);
        svgContent += `<tspan x="${CONFIG.marginLeft}" dy="${dy}">${escapeXml(line)}</tspan>\n`;
    });

    svgContent += `</text>\n`;
    currentY += (headerFontSize * 1.5); // Add spacing after header

    // Process Bullets
    items.forEach((itemText) => {
        // Render Bullet Square
        const bulletX = CONFIG.marginLeft;
        // Text starts to the right
        const textX = CONFIG.marginLeft + CONFIG.bulletTextGap;

        // Calculate max text width for bullets based on the requested maxLineWidth
        // The requested maxLineWidth includes the margin area? 
        // Logic: maxLineWidth is usually the width of the "text block".
        // If we want the Right Margin to effectively move in, we calculate width based on maxLineWidth.
        // If maxLineWidth is 800, and marginLeft is 50.
        // Hedaer text goes from 50 to 850.
        // Bullet starts at 50. Text starts at 100.
        // Bullet text should go from 100 to 850 (width 750).
        // So maxTextWidth = maxLineWidth - bulletTextGap.

        const maxTextWidth = maxLineWidth - CONFIG.bulletTextGap;

        const textLines = wrapText(itemText, maxTextWidth, bodyFontSize);

        // Calculate Bullet Y position: 
        const bulletY = currentY - (bodyFontSize * 0.7);

        svgContent += `<!-- Bullet Item -->\n`;
        svgContent += `<rect x="${bulletX}" y="${bulletY}" width="${CONFIG.bulletSize}" height="${CONFIG.bulletSize}" fill="${CONFIG.bulletColor}" />\n`;

        svgContent += `<text x="${textX}" y="${currentY}" font-family="${CONFIG.fontFamily}" font-size="${bodyFontSize}" fill="${CONFIG.textColor}">\n`;

        textLines.forEach((line, i) => {
            const dy = i === 0 ? 0 : (bodyFontSize * CONFIG.lineHeight);
            if (i > 0) currentY += (bodyFontSize * CONFIG.lineHeight);
            svgContent += `<tspan x="${textX}" dy="${dy}">${escapeXml(line)}</tspan>\n`;
        });

        svgContent += `</text>\n`;
        currentY += (bodyFontSize * CONFIG.lineHeight);
        currentY += CONFIG.paragraphGap;
    });

    const canvasHeight = CONFIG.canvasHeight;

    return `
<svg width="${CONFIG.canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${CONFIG.canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white" />
    ${svgContent}
</svg>`.trim();
}

/**
 * Parses a generated SVG string to extract the header and bullet items.
 * @param svgString The raw SVG string.
 * @returns An object containing the header and an array of items.
 */
export function parseSVGString(svgString: string): { header: string, items: string[] } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");

    // The generator creates:
    // 1. Header <text> block
    // 2. Multiple Bullet Item <text> blocks
    // We can identify them by order or by class if we added one, but we didn't.
    // However, we did add comments <!-- Header --> and <!-- Bullet Item -->, but those are harder to query via DOM API.
    // Structure relying: 
    // - The first <text> element is the Header.
    // - Subsequent <text> elements are Bullet items.

    // Note: This relies strictly on the structure produced by generateSVGString.
    const textElements = Array.from(doc.querySelectorAll('text'));

    if (textElements.length === 0) {
        return { header: '', items: [] };
    }

    const extractTextFromElement = (el: Element): string => {
        // Concatenate all tspan children content
        const tspans = Array.from(el.querySelectorAll('tspan'));
        if (tspans.length > 0) {
            return tspans.map(span => span.textContent || '').join(' ');
        }
        // Fallback if no tspans (shouldn't happen with our generator for multiline, but possibly for single line if we changed logic)
        return el.textContent || '';
    };

    const header = extractTextFromElement(textElements[0]);
    const items = textElements.slice(1).map(extractTextFromElement);

    return { header, items };
}
