
import * as fs from 'fs';
import * as path from 'path';

const svgPath = path.join(__dirname, '../examples/spoordeelwinkel-091225.svg');
const outputPath = path.join(__dirname, '../src/assets.ts');

const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Look for the second image tag which appeared to be the background
// It was around line 16062 in the file view
// Regex to find xlink:href="data:image/png;base64,..."
// The first one was a mask (1x1 size), we want the one that had a transform related to the page size or is larger
// The second identified image had id="image1975" and mask="url(#mask1704)" ?
// Let's just find all images and check their lengths or contexts.
// Actually, earlier grep showed:
// 8977: <image ... id="image1704" (mask)
// 16057: <image ... id="image1975" (likely background)


const matches = svgContent.match(/xlink:href="(data:image\/png;base64,[^"]+)"/g);

if (matches && matches.length > 0) {
    console.log(`Found ${matches.length} images.`);

    let maxLen = 0;
    let bestImage = "";

    matches.forEach((m, i) => {
        const data = m.replace('xlink:href="', '').replace('"', '');
        console.log(`Image ${i}: length ${data.length}`);
        if (data.length > maxLen) {
            maxLen = data.length;
            bestImage = data;
        }
    });

    // Save the largest one
    const fileContent = `export const BACKGROUND_IMAGE = "${bestImage}";\n`;
    fs.writeFileSync(outputPath, fileContent);
    console.log(`Successfully extracted largest background image (length ${maxLen}) to ${outputPath}`);

} else {
    console.error('Could not find any image data in SVG');
}
