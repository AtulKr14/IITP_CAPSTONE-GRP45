import { useEffect, useRef } from 'react';
import { getQuizHistory, type QuizResult } from '@/lib/storage';

interface PerformanceChartProps {
  quizResult?: QuizResult;
}

export function PerformanceChart({ quizResult }: PerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const history = getQuizHistory();
    const data = quizResult ? [...history, quizResult] : history;
    
    if (data.length === 0) return;

    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;

    // Draw background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    const maxPoints = Math.min(data.length, 10);
    for (let i = 0; i <= maxPoints; i++) {
      const x = padding + (chartWidth / maxPoints) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = 100 - (i * 20);
      const y = padding + (chartHeight / 5) * i;
      ctx.fillText(`${value}%`, padding - 10, y + 4);
    }

    // Draw performance line
    if (data.length > 1) {
      const recentData = data.slice(-10); // Last 10 quizzes
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();

      recentData.forEach((quiz, index) => {
        const x = padding + (chartWidth / (recentData.length - 1)) * index;
        const y = canvas.height - padding - (quiz.percentage / 100) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();

      // Draw data points
      ctx.fillStyle = '#3b82f6';
      recentData.forEach((quiz, index) => {
        const x = padding + (chartWidth / (recentData.length - 1)) * index;
        const y = canvas.height - padding - (quiz.percentage / 100) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Highlight current quiz result
      if (quizResult) {
        const lastIndex = recentData.length - 1;
        const x = padding + (chartWidth / (recentData.length - 1)) * lastIndex;
        const y = canvas.height - padding - (quizResult.percentage / 100) * chartHeight;
        
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Performance Over Time', canvas.width / 2, 25);

  }, [quizResult]);

  return (
    <div className="w-full h-64 bg-gray-50 rounded-lg p-4">
      <canvas
        ref={chartRef}
        width={600}
        height={250}
        className="w-full h-full"
        style={{ maxWidth: '100%' }}
      />
    </div>
  );
}
