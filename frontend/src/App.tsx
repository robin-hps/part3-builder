import { useState, type DragEvent, type ChangeEvent, useEffect, useCallback } from 'react';
import { generateSVGString, parseSVGString } from './svg-generator';

const NumberControl = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) => {
  const handleIncrement = () => {
    if (value + step <= max) onChange(value + step);
  };

  const handleDecrement = () => {
    if (value - step >= min) onChange(value - step);
  };

  return (
    <div className="space-y-1">
      <label className="text-xs text-slate-500 font-medium ml-1">{label}</label>
      <div className="flex items-center gap-1 p-1 bg-white/50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        <button
          onClick={handleDecrement}
          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          type="button"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
          </svg>
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 w-full text-center bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 p-0"
        />
        <button
          onClick={handleIncrement}
          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          type="button"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

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
  const [maxLineWidth, setMaxLineWidth] = useState<number>(925);

  const handleGenerate = useCallback(() => {
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
  }, [inputText, headerFontSize, bodyFontSize, maxLineWidth]);

  // Auto-generate when configuration changes
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

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
          const newText = `${header}\n\n${items.map(item => `- ${item}`).join('\n')}`;
          setInputText(newText);
        } catch (err) {
          console.error('Error parsing SVG:', err);
          alert('Failed to parse the SVG file.');
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
    <div
      className="flex h-screen w-full overflow-hidden text-slate-800 relative"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {/* Global Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-indigo-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in duration-200 pointer-events-none">
          <svg className="w-20 h-20 mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h2 className="text-3xl font-bold">Drop SVG to Import</h2>
          <p className="mt-2 text-indigo-100">Release to load content into the editor</p>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-[48rem] flex-shrink-0 flex flex-col glass-panel border-r border-white/50 z-10 glass-shadow">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 leading-tight">
          Part 3 Builder
        </h1>
        <p className="text-[10px] text-slate-500 font-medium">Ticket Generator</p>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Content Editor */}
          <section className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-slate-700">Content</label>
              <button
                onClick={() => document.getElementById('fileInput')?.click()}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Import SVG
              </button>
              <input
                type="file"
                id="fileInput"
                className="hidden"
                accept=".svg"
                onChange={onFileSelect}
              />
            </div>
            <textarea
              className="w-full h-[600px] p-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm leading-relaxed resize-none custom-scrollbar font-mono"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter header and bullet points..."
            />
          </section>

          {/* Configuration */}
          <section>
            <label className="block text-sm font-medium mb-3 text-slate-700">Style Configuration</label>
            <div className="space-y-4">
              <NumberControl
                label="Header Size"
                value={headerFontSize}
                onChange={setHeaderFontSize}
              />
              <NumberControl
                label="Body Size"
                value={bodyFontSize}
                onChange={setBodyFontSize}
              />
              <NumberControl
                label="Max Line Width"
                value={maxLineWidth}
                onChange={setMaxLineWidth}
                step={10}
              />
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-white/20 bg-white/40 backdrop-blur-sm flex items-center justify-between gap-3">
          <button
            onClick={handleGenerate}
            className="w-[40%] py-1 px-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-xs flex items-center justify-center gap-2"
          >
            <span>Generate Preview</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </button>

          <button
            onClick={handleDownload}
            disabled={!svgOutput}
            className="w-[40%] py-1 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-sm transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span>Download SVG</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">


        {/* Canvas Background & Preview */}
        <div className="flex-1 overflow-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20 flex justify-center p-10 relative">
          <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>

          <div className={`transition-all duration-500 ease-out transform m-auto ${svgOutput ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}>
            {svgOutput ? (
              <div
                dangerouslySetInnerHTML={{ __html: svgOutput }}
                className="bg-white shadow-2xl shadow-indigo-500/20 ring-1 ring-slate-900/5"
                style={{ maxWidth: '100%' }}
              />
            ) : (
              <div className="text-center p-12 glass-panel rounded-3xl border-dashed border-2 border-slate-300/50">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h3 className="text-xl font-medium text-slate-700">Ready to Create</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto">Configure your options in the sidebar and click Generate to see the preview.</p>
                <p className="text-xs text-indigo-500 mt-4 font-medium animate-pulse">✨ Drop an SVG anywhere to start</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
