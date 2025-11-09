
import React from 'react';

interface CheckboxGroupProps {
    title: string;
    options: string[];
    selectedOptions: string[];
    onChange: (value: string) => void;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ title, options, selectedOptions, onChange }) => {
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-medium text-slate-300">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {options.map((option) => (
                    <label key={option} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-slate-700/50 transition-colors">
                        <input
                            type="checkbox"
                            checked={selectedOptions.includes(option)}
                            onChange={() => onChange(option)}
                            className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-800"
                        />
                        <span className="text-slate-300 text-sm">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default CheckboxGroup;
