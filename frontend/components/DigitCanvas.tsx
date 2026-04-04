'use client';

import { useRef, useEffect, useState } from 'react';

export function DigitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 500;
    canvas.height = 500;

    // Fill with white background
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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const coords = getCoordinates(e.nativeEvent as MouseEvent | TouchEvent);
    if (coords) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
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
    try {
      // Placeholder prediction - in a real app, this would call an ML model
      const randomDigit = Math.floor(Math.random() * 10);
      setTimeout(() => {
        setPrediction(`Predicted digit: ${randomDigit}`);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Prediction error:', error);
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

        {prediction && (
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
