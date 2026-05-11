import { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

function formatBRL(num: number): string {
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseBRL(str: string): number {
  if (!str) return 0;
  // Handle both "1.000,00" and "1000" and "1000.50"
  const withoutDots = str.replace(/\./g, '');
  const withDot = withoutDots.replace(',', '.');
  return parseFloat(withDot) || 0;
}

export function CurrencyInput({ value, onChange, placeholder = '0,00', className, autoFocus }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Sync external value to display when not editing
  useEffect(() => {
    if (!isEditing) {
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) {
        setDisplayValue(formatBRL(num));
      } else {
        setDisplayValue('');
      }
    }
  }, [value, isEditing]);

  const handleFocus = () => {
    setIsEditing(true);
    // Show raw number for easy editing
    const num = parseBRL(displayValue);
    if (num > 0) {
      setDisplayValue(num % 1 === 0 ? num.toString() : num.toFixed(2).replace('.', ','));
    } else {
      setDisplayValue('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only digits and comma
    const cleaned = raw.replace(/[^\d,]/g, '');
    setDisplayValue(cleaned);
    // Parse for parent
    const num = parseBRL(cleaned);
    onChange(num > 0 ? num.toString() : cleaned);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const num = parseBRL(displayValue);
    if (num > 0) {
      const formatted = formatBRL(num);
      setDisplayValue(formatted);
      onChange(num.toString());
    } else {
      setDisplayValue('');
      onChange('');
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      inputMode="decimal"
      autoFocus={autoFocus}
    />
  );
}
