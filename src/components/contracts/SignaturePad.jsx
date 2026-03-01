import React, { useEffect, useRef, useState } from 'react';
import Button from '../common/Button';

export default function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });

  const [typedName, setTypedName] = useState(value?.typedName || '');
  const [drawnSignatureDataUrl, setDrawnSignatureDataUrl] = useState(
    value?.drawnSignatureDataUrl || ''
  );

  useEffect(() => {
    setTypedName(value?.typedName || '');
    setDrawnSignatureDataUrl(value?.drawnSignatureDataUrl || '');
    // We intentionally don't redraw from dataUrl (v1)
  }, [value?.typedName, value?.drawnSignatureDataUrl]);

  const emit = (next) => {
    onChange?.(next);
  };

  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111827'; // gray-900
    return ctx;
  };

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0]?.clientX : e.clientX;
    const clientY = e.touches ? e.touches[0]?.clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const start = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    lastRef.current = getPoint(e);
  };

  const move = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    const p = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
  };

  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    setDrawnSignatureDataUrl(url);
    emit({ typedName, drawnSignatureDataUrl: url });
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setDrawnSignatureDataUrl('');
    emit({ typedName, drawnSignatureDataUrl: '' });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Typed signature (full name)
        </label>
        <input
          value={typedName}
          onChange={(e) => {
            const next = e.target.value;
            setTypedName(next);
            emit({ typedName: next, drawnSignatureDataUrl });
          }}
          placeholder="Type your full name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Drawn signature (optional)
          </label>
          <Button variant="outline" size="sm" onClick={clear}>
            Clear
          </Button>
        </div>
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={600}
            height={160}
            className="w-full h-40 touch-none"
            onMouseDown={start}
            onMouseMove={move}
            onMouseUp={end}
            onMouseLeave={end}
            onTouchStart={start}
            onTouchMove={move}
            onTouchEnd={end}
          />
        </div>
        {drawnSignatureDataUrl ? (
          <p className="text-xs text-gray-500 mt-1">Drawn signature captured.</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">Draw inside the box above.</p>
        )}
      </div>
    </div>
  );
}

