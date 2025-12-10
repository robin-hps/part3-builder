import { useState, type DragEvent, type ChangeEvent } from 'react';
import { generateSVGString, parseSVGString } from './svg-generator';

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
      <aside className="w-96 flex-shrink-0 flex flex-col glass-panel border-r border-white/50 z-10 glass-shadow">
        <div className="p-6 border-b border-white/20">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Part 3 Builder
          </h1>
          <p className="text-xs text-slate-500 mt-1">Create premium ticket assets</p>
        </div>

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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Header Size</label>
                <input
                  type="number"
                  value={headerFontSize}
                  onChange={(e) => setHeaderFontSize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white/50 focus:bg-white focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Body Size</label>
                <input
                  type="number"
                  value={bodyFontSize}
                  onChange={(e) => setBodyFontSize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white/50 focus:bg-white focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-slate-500">Max Line Width</label>
                <input
                  type="number"
                  value={maxLineWidth}
                  onChange={(e) => setMaxLineWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white/50 focus:bg-white focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-white/20 bg-white/40 backdrop-blur-sm">
          <button
            onClick={handleGenerate}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
          >
            <span>Generate Preview</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/30 backdrop-blur-md border-b border-white/20 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Canvas Mode</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={!svgOutput}
              className="px-4 py-2 text-xs font-medium bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              SVG
            </button>
            <button
              onClick={handleDownloadJpg}
              disabled={!svgOutput}
              className="px-4 py-2 text-xs font-medium bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              JPG
            </button>
          </div>
        </header>

        {/* Canvas Background & Preview */}
        <div className="flex-1 overflow-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20 flex items-center justify-center p-10 relative">
          <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>

          <div className={`transition-all duration-500 ease-out transform ${svgOutput ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}>
            {svgOutput ? (
              <div
                dangerouslySetInnerHTML={{ __html: svgOutput }}
                className="bg-white shadow-2xl shadow-indigo-500/20 ring-1 ring-slate-900/5"
                style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 120px)' }}
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
