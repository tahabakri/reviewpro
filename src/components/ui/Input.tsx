import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  required,
  id,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value !== '');
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value !== '');
    props.onChange?.(e);
  };

  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="relative">
      <div className={`
        relative group
        ${error ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}
      `}>
        <input
          {...props}
          id={inputId}
          className={`
            block w-full px-4 py-3 rounded-lg
            bg-white/5 backdrop-blur-sm border
            text-gray-900 dark:text-white
            placeholder-transparent
            focus-ring
            ${error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-200 dark:border-gray-700 focus:border-primary-indigo dark:focus:border-primary-purple'
            }
            ${className}
          `}
          placeholder={label}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          required={required}
        />
        <label
          htmlFor={inputId}
          className={`
            absolute left-4 transition-all duration-200 cursor-text
            ${(isFocused || hasValue)
              ? '-top-2.5 text-sm bg-white dark:bg-dark-navy px-1'
              : 'top-3.5'
            }
            ${error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}
            ${isFocused ? 'text-primary-indigo dark:text-primary-purple' : ''}
          `}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {(error || helperText) && (
        <p
          className={`mt-1 text-sm ${
            error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;