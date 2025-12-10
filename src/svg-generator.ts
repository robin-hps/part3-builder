/// <reference lib="dom" />
// Configuration
export const CONFIG = {
    canvasWidth: 1025,
    canvasHeight: 1526,
    fontFamily: 'Arial, Helvetica, sans-serif',
    headerFontSize: 60,
    bodyFontSize: 24,
    lineHeight: 1.4,
    marginLeft: 50,
    marginTop: 50,
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
export function generateSVGString(header: string, items: string[]): string {
    let svgContent = '';
    let currentY = CONFIG.marginTop;
    console.log("Current Y: ", currentY);

    // Header
    const headerLines = wrapText(header, CONFIG.canvasWidth - (CONFIG.marginLeft * 2), CONFIG.headerFontSize);

    svgContent += `<!-- Header -->\n`;
    svgContent += `<text x="${CONFIG.marginLeft}" y="${currentY}" font-family="${CONFIG.fontFamily}" font-weight="bold" font-size="${CONFIG.headerFontSize}" fill="${CONFIG.textColor}">\n`;

    headerLines.forEach((line, i) => {
        const dy = i === 0 ? 0 : (CONFIG.headerFontSize * CONFIG.lineHeight);
        if (i > 0) currentY += (CONFIG.headerFontSize * CONFIG.lineHeight);
        svgContent += `<tspan x="${CONFIG.marginLeft}" dy="${dy}">${escapeXml(line)}</tspan>\n`;
    });

    svgContent += `</text>\n`;
    currentY += (CONFIG.headerFontSize * 1.5); // Add spacing after header

    // Process Bullets
    items.forEach((itemText) => {
        // Render Bullet Square
        const bulletX = CONFIG.marginLeft;
        // Text starts to the right
        const textX = CONFIG.marginLeft + CONFIG.bulletTextGap;
        const maxTextWidth = CONFIG.canvasWidth - textX - CONFIG.marginLeft; // Right margin same as left

        const textLines = wrapText(itemText, maxTextWidth, CONFIG.bodyFontSize);

        // Calculate Bullet Y position: 
        const bulletY = currentY - (CONFIG.bodyFontSize * 0.7);

        svgContent += `<!-- Bullet Item -->\n`;
        // Using circle for bullet might look better, but stick to rect if requested or original style
        svgContent += `<rect x="${bulletX}" y="${bulletY}" width="${CONFIG.bulletSize}" height="${CONFIG.bulletSize}" fill="${CONFIG.bulletColor}" />\n`;

        svgContent += `<text x="${textX}" y="${currentY}" font-family="${CONFIG.fontFamily}" font-size="${CONFIG.bodyFontSize}" fill="${CONFIG.textColor}">\n`;

        textLines.forEach((line, i) => {
            const dy = i === 0 ? 0 : (CONFIG.bodyFontSize * CONFIG.lineHeight);
            if (i > 0) currentY += (CONFIG.bodyFontSize * CONFIG.lineHeight);
            svgContent += `<tspan x="${textX}" dy="${dy}">${escapeXml(line)}</tspan>\n`;
        });

        svgContent += `</text>\n`;
        currentY += (CONFIG.bodyFontSize * CONFIG.lineHeight);
        currentY += CONFIG.paragraphGap;
    });

    // Fixed canvas height as per reference
    const canvasHeight = CONFIG.canvasHeight;

    return `
<svg width="${CONFIG.canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${CONFIG.canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="${CONFIG.canvasWidth}" height="${canvasHeight}" fill="white"/>
    ${svgContent}
</svg>`.trim();
}
