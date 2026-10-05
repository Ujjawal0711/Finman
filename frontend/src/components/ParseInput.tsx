import { useEffect, useRef, useState } from 'react';

const SAMPLE = 'Rs.850.00 debited from A/c XX4521 on 23-08-26 to VPA swiggy@icici (UPI Ref No 523614789012)';
const MAX_SIDE = 1600;

// Phone photos run 3 to 6 MB; shrink before upload to save bandwidth and tokens.
async function shrink(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), 'image/jpeg', 0.8));
}

interface Props {
  text: string;
  setText: (t: string) => void;
  busy: boolean;
  error: string;
  onParseText: () => void;
  onParseFile: (blob: Blob, name: string) => void;
  onManual: () => void;
}

export default function ParseInput({ text, setText, busy, error, onParseText, onParseFile, onManual }: Props) {
  const [tab, setTab] = useState<'text' | 'file'>('text');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [fileError, setFileError] = useState('');
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file?.type.startsWith('image/')) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function parseFile() {
    if (!file) return;
    setFileError('');
    try {
      onParseFile(await shrink(file), file.name.replace(/\.[^.]+$/, '') + (file.type.startsWith('image/') ? '.jpg' : '.txt'));
    } catch {
      setFileError("Couldn't read that image. Try a different photo.");
    }
  }

  return (
    <div className="card">
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'text'} onClick={() => setTab('text')}>Paste SMS or text</button>
        <button role="tab" aria-selected={tab === 'file'} onClick={() => setTab('file')}>Upload bill</button>
      </div>

      {error && <div className="banner error" role="alert">{error}</div>}

      {tab === 'text' ? (
        <>
          <label htmlFor="parse-text" className="hint">Paste a bank SMS, UPI notification or order text.</label>
          <textarea id="parse-text" rows={6} maxLength={5000} placeholder={SAMPLE} value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && text.trim() && !busy) onParseText(); }} />
          <div className="hint" style={{ textAlign: 'right' }}>{text.length} / 5000</div>
          <div className="actions" style={{ marginTop: 'var(--s3)', alignItems: 'center' }}>
            <button className="primary" onClick={onParseText} disabled={!text.trim() || busy} aria-busy={busy}>
              {busy ? 'Parsing...' : 'Parse with AI'}
            </button>
            <button className="link" onClick={onManual}>Enter manually</button>
          </div>
        </>
      ) : (
        <>
          {fileError && <div className="banner error" role="alert">{fileError}</div>}
          <label htmlFor="bill-file" className="hint">A photo of a bill or receipt (JPG, PNG, WebP) or a .txt file.</label>
          <input id="bill-file" ref={picker} type="file" accept="image/*,.txt" capture="environment"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); setFileError(''); }} />
          {preview && <img className="thumb" src={preview} alt="Selected bill" />}
          <div className="actions" style={{ marginTop: 'var(--s3)', alignItems: 'center' }}>
            <button className="primary" onClick={parseFile} disabled={!file || busy} aria-busy={busy}>
              {busy ? 'Parsing...' : 'Parse bill'}
            </button>
            <button className="link" onClick={onManual}>Enter manually</button>
          </div>
        </>
      )}
    </div>
  );
}
