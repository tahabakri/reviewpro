import React from 'react';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ChartProps {
  data: ChartData[];
  title?: string;
}

export const Chart: React.FC<ChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      <div className="w-full h-[300px] relative">
        <div className="flex items-end h-full gap-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full relative group">
                <div
                  className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg transition-all duration-300 group-hover:opacity-90"
                  style={{
                    height: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.value}
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.name}
              </span>
            </div>
          ))}
        </div>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-500 dark:text-gray-400">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="mr-2">
                {Math.round((maxValue * (4 - i)) / 4)}
              </span>
              <div className="w-full border-b border-gray-200 dark:border-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chart;