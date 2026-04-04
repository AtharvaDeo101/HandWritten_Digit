'use client';

import React, { useRef, useEffect, useState } from 'react';

export function DigitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Logical size used for drawing
    canvas.width = 350;
    canvas.height = 350;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e instanceof MouseEvent) {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    } else if (e instanceof TouchEvent) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return null;
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e.nativeEvent as MouseEvent | TouchEvent);
    if (coords) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      }
    }
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (!isDrawing) return;

    const coords = getCoordinates(e.nativeEvent as MouseEvent | TouchEvent);
    if (coords) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 20; // thicker strokes to mimic MNIST
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
  };

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          },
          'image/png',
          1.0
        );
      });

      const formData = new FormData();
      formData.append('image', blob, 'digit.png');

      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.message === 'Unrecognized digit' || result.prediction === null) {
        setPrediction('Unrecognized digit');
      } else {
        setPrediction(
          `Predicted digit: ${result.prediction}`
        );
      }
    } catch (err: any) {
      console.error('Prediction error:', err);
      setError(err.message || 'Unknown error');
      setPrediction('Prediction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setPrediction(null);
      setError(null);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2
        style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '24px',
          fontFamily: 'var(--font-syne, sans-serif)',
        }}
      >
        Draw a Digit
      </h2>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            border: '2px solid #666',
            cursor: 'crosshair',
            borderRadius: '8px',
            backgroundColor: 'white',
            maxWidth: '100%',
            height: 'auto',
            touchAction: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handlePredict}
            disabled={isLoading}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: '#ff3e00',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            {isLoading ? 'Predicting...' : 'Predict'}
          </button>
          <button
            onClick={handleClear}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: '#333',
              color: 'white',
              border: '1px solid #555',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Clear
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffebee',
              border: '1px solid #f44336',
              borderRadius: '6px',
              color: '#d32f2f',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {prediction && !error && (
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #ff3e00',
              borderRadius: '6px',
              color: '#ff3e00',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            {prediction}
          </div>
        )}
      </div>
    </div>
  );
}