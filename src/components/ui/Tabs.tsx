import React from 'react';

interface Tab {
  id: string;
  name: string;
}

interface TabsProps {
  tabs: Tab[];
  selectedIndex: number;
  onChange: (index: number) => void;
  children: React.ReactNode[];
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  selectedIndex,
  onChange,
  children
}) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200">
        <div 
          role="tablist"
          aria-label="Dashboard tabs"
          className="flex space-x-8"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => onChange(index)}
              className={`py-4 px-1 text-sm font-medium border-b-2 focus:outline-none ${
                selectedIndex === index
                  ? 'border-primary-indigo text-primary-indigo'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selectedIndex === index ? "true" : "false"}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={selectedIndex === index ? 0 : -1}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        {React.Children.map(children, (child, index) => (
          <div
            role="tabpanel"
            id={`tabpanel-${tabs[index].id}`}
            aria-labelledby={`tab-${tabs[index].id}`}
            hidden={selectedIndex !== index}
            tabIndex={0}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};