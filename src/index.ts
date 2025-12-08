import * as fs from 'fs';
import * as path from 'path';
import { generateSVGString } from './svg-generator';

function generateSVG() {
    const inputPath = path.join(__dirname, '../data/input.txt');
    const outputPath = path.join(__dirname, '../output.svg');

    const inputData = fs.readFileSync(inputPath, 'utf8');
    const rawLines = inputData.split('\n').filter(l => l.trim() !== '');

    if (rawLines.length === 0) {
        console.error('Input file is empty.');
        return;
    }

    // Header (First line assumption)
    const headerText = rawLines[0];

    // Process Bullets
    const bulletLines = rawLines.slice(1).map(line => line.replace(/^-\s*/, '').trim());

    const svgContent = generateSVGString(headerText, bulletLines);

    fs.writeFileSync(outputPath, svgContent);
    console.log(`Generated SVG at ${outputPath}`);
}

generateSVG();
