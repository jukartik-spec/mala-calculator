import React, { useState, useEffect } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 0.01,
  className = '',
  placeholder,
  disabled = false,
}) => {
  const [localValue, setLocalValue] = useState<string>(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Update local value when external value changes (but not while focused)
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty, numbers, and decimal points while typing
    if (inputValue === '' || /^-?\d*\.?\d*$/.test(inputValue)) {
      setLocalValue(inputValue);
      
      // Only update parent if it's a valid number
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        onChange(numValue);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // On blur, ensure we have a valid number
    let numValue = parseFloat(localValue);
    if (isNaN(numValue)) {
      numValue = 0;
    }
    
    // Apply min/max constraints
    if (min !== undefined && numValue < min) {
      numValue = min;
    }
    if (max !== undefined && numValue > max) {
      numValue = max;
    }
    
    setLocalValue(numValue.toString());
    onChange(numValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      min={min}
      max={max}
      step={step}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};
