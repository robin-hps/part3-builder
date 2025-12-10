
import * as fs from 'fs';
import * as path from 'path';
import { generateSVGString } from './svg-generator';

const header = "NS Dagretour";
const items = [
    "Geldig op 15 december 2025",
    "Geldig in trein, bus, tram en metro",
    "Niet geldig in Thalys en Eurostar"
];

const svgContent = generateSVGString(header, items);
const outputPath = path.join(__dirname, '../output-new.svg');

fs.writeFileSync(outputPath, svgContent);
console.log(`Generated SVG to ${outputPath}`);
console.log(`Length: ${svgContent.length}`);
