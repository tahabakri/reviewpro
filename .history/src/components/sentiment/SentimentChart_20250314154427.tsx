import React from 'react';

interface ChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const PieChart: React.FC<ChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="relative w-full h-[200px]">
      <div className="flex justify-center items-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {data.map((item, index) => {
            const startAngle = data
              .slice(0, index)
              .reduce((sum, d) => sum + (d.value / total) * 360, 0);
            const endAngle = startAngle + (item.value / total) * 360;
            
            return (
              <path
                key={item.name}
                d={describeArc(50, 50, 40, startAngle, endAngle)}
                fill={item.color}
              />
            );
          })}
        </svg>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">
              {item.name} ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TimelineChart: React.FC<{
  data: Array<{
    date: string;
    value: number;
    volume: number;
  }>;
}> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const maxVolume = Math.max(...data.map(d => d.volume));
  
  return (
    <div className="relative w-full h-[200px]">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Line chart */}
        <path
          d={`M ${data
            .map(
              (d, i) =>
                `${(i / (data.length - 1)) * 100} ${
                  50 - (d.value / maxValue) * 45
                }`
            )
            .join(' L ')}`}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="2"
        />
        
        {/* Volume bars */}
        {data.map((d, i) => (
          <rect
            key={i}
            x={((i / (data.length - 1)) * 100) - 1}
            y={50 - (d.volume / maxVolume) * 20}
            width="2"
            height={(d.volume / maxVolume) * 20}
            fill="#e5e7eb"
            opacity="0.5"
          />
        ))}
      </svg>
      
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((d, i) => (
          <div key={i} className="text-center">
            {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to create SVG arc path
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  
  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'L',
    x,
    y,
    'Z',
  ].join(' ');
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}