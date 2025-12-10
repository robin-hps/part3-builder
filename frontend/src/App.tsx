import { useState, type DragEvent, type ChangeEvent } from 'react';
import { IntlProvider } from 'react-intl';
import { generateSVGString, parseSVGString } from './svg-generator';
import { uploadAssetToS3 } from './s3-uploader';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import MultilineTextInput from '@commercetools-uikit/multiline-text-input';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import Card from '@commercetools-uikit/card';


// Basic theme fallback if needed, though usually handled by css-vars or context
// UI Kit often expects a theme provider or globals
// We will wrap with IntlProvider as required.

function App() {
  const [inputText, setInputText] = useState<string>(`Dagretour Dal Week
  
- Het Dagretour Dal Week is een vervoerbewijs dat geldig is voor de heen- en terugreis op het traject, in de klasse, op de datum die vermeld staan op het Dagretour Dal Week. De heen- en terugreis mogen op deze datum worden onderbroken op een tussengelegen station op het gekozen traject
- Het Dagretour Dal Week is alleen geldig in de daluren: maandag van 04:00 – 06:30, tussen 9:00 – 16:00 en 18:30 – 23:59, dinsdag t/m donderdag van 00:00 – 6:30, 9:00 – 16:00 en 18:30 – 23:59 en vrijdag van 00:00 – 6:30 en tussen 9:00 – 16:00 uur. Het is niet toegestaan om tijdens de spits te reizen.
- Het Dagretour Dal Week is persoonlijk en niet overdraagbaar. Bij controle moet een geldig identiteitsdocument met foto worden getoond.
- Voor Intercity direct en Eurocity Direct tussen Rotterdam Centraal en Schiphol Airport en voor het binnenlandse traject ICE is het betalen van een toeslag verplicht.
- Het Dagretour Dal Week is niet geldig in Eurostar en Nightjet. Bekijk de overige Voorwaarden Dagretour Dal Week via www.ns.nl/voorwaarden-losse-vervoerbewijzen.`);


  const [svgOutput, setSvgOutput] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [headerFontSize, setHeaderFontSize] = useState<number>(60);
  const [bodyFontSize, setBodyFontSize] = useState<number>(24);
  // Default roughly equals CONFIG.canvasWidth - 2*marginLeft (1025 - 100 = 925)
  const [maxLineWidth, setMaxLineWidth] = useState<number>(925);
  const [isUploading, setIsUploading] = useState(false);

  const handleGenerate = () => {
    const rawLines = inputText.split('\n').filter(l => l.trim() !== '');
    if (rawLines.length === 0) return;

    const header = rawLines[0];
    const bulletLines = rawLines.slice(1).map(line => line.replace(/^-\s*/, '').trim());

    const svg = generateSVGString(header, bulletLines, {
      headerFontSize,
      bodyFontSize,
      maxLineWidth
    });
    setSvgOutput(svg);
  };

  const handleDownload = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'part3-ticket.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJpg = () => {
    if (!svgOutput) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      // Set canvas dimensions to match the SVG's dynamic dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const jpgUrl = canvas.toDataURL('image/jpeg', 0.9);
      const a = document.createElement('a');
      a.href = jpgUrl;
      a.download = 'part3-ticket.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const handleUpload = async () => {
    if (!svgOutput) return;
    setIsUploading(true);
    try {
      const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
      const filename = `ticket-${Date.now()}.svg`;
      const url = await uploadAssetToS3(blob, filename, 'image/svg+xml');
      alert(`Upload successful! URL: ${url}`);
    } catch (err) {
      alert('Upload failed. Check console for details.');
    } finally {
      setIsUploading(false);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== 'image/svg+xml') {
      alert('Please upload an SVG file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          const { header, items } = parseSVGString(content);
          // Reconstruct input text format
          const newText = `${header}\n\n${items.map(item => `- ${item}`).join('\n')}`;
          setInputText(newText);
        } catch (err) {
          console.error('Error parsing SVG:', err);
          alert('Failed to parse the SVG file. Make sure it was generated by this tool.');
        }
      }
    };
    reader.readAsText(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <IntlProvider locale="en">
      <div className="min-h-screen bg-gray-100 p-8 font-sans">
        <Spacings.Stack scale="xl">
          <Text.Headline as="h1">Commercetools Part 3 Builder</Text.Headline>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <Spacings.Stack scale="m">
                <Text.Subheadline as="h4">Content Editor</Text.Subheadline>
                <Text.Body>
                  Enter the text below. The first line is the header. Lines starting with "- " are bullet points.
                </Text.Body>

                <div
                  className={`border-2 border-dashed rounded p-4 text-center cursor-pointer transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    accept=".svg"
                    onChange={onFileSelect}
                  />
                  <Text.Body tone="secondary">
                    Drag & Drop existing SVG here or click to upload to edit
                  </Text.Body>
                </div>

                <Spacings.Stack scale="s">
                  <label className="font-bold text-sm">Input Text</label>
                  <MultilineTextInput
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    placeholder="Enter your terms here..."
                  />
                </Spacings.Stack>

                <Spacings.Stack scale="s">
                  <label className="font-bold text-sm">Font Configuration</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1 text-gray-600">Header Size</label>
                      <input
                        type="number"
                        value={headerFontSize}
                        onChange={(e) => setHeaderFontSize(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-gray-600">Body Size</label>
                      <input
                        type="number"
                        value={bodyFontSize}
                        onChange={(e) => setBodyFontSize(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs mb-1 text-gray-600">Max Line Width</label>
                      <input
                        type="number"
                        value={maxLineWidth}
                        onChange={(e) => setMaxLineWidth(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </Spacings.Stack>

                <PrimaryButton
                  label="Generate Preview"
                  onClick={handleGenerate}
                />
              </Spacings.Stack>
            </Card>

            <Card>
              <Spacings.Stack scale="m">
                <div className="flex justify-between items-center">
                  <Text.Subheadline as="h4">Live Preview</Text.Subheadline>
                  <div className="flex gap-2">
                    <SecondaryButton
                      label="Download SVG"
                      onClick={handleDownload}
                      isDisabled={!svgOutput}
                    />
                    <SecondaryButton
                      label="Download JPG"
                      onClick={handleDownloadJpg}
                      isDisabled={!svgOutput}
                    />
                    <SecondaryButton
                      label={isUploading ? 'Uploading...' : 'Upload to S3'}
                      onClick={handleUpload}
                      isDisabled={!svgOutput || isUploading}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded p-4 flex items-center justify-center min-h-[400px]">
                  {svgOutput ? (
                    <div dangerouslySetInnerHTML={{ __html: svgOutput }} className="shadow-lg bg-white max-w-full" />
                  ) : (
                    <Text.Detail tone="secondary">Click "Generate Preview" to render the ticket</Text.Detail>
                  )}
                </div>
              </Spacings.Stack>
            </Card>
          </div>
        </Spacings.Stack>
      </div>
    </IntlProvider>
  );
}

export default App;
