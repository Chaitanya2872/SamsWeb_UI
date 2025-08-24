import  { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    label,
    error,
    helperText,
    size = 'md',
    fullWidth = false,
    required = false,
    options,
    placeholder,
    className,
    disabled,
    ...props
  }, ref) => {
    const hasError = !!error;
    
    const baseSelectClasses = `
      block border rounded-lg appearance-none bg-white
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary-50
    `;

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm pr-8',
      md: 'px-4 py-2.5 text-sm pr-10',
      lg: 'px-4 py-3 text-base pr-10'
    };

    const selectClasses = clsx(
      baseSelectClasses,
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      hasError
        ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500 text-danger-900'
        : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500 text-secondary-900',
      className
    );

    const iconSizeClasses = {
      sm: 'w-4 h-4 right-2',
      md: 'w-5 h-5 right-3',
      lg: 'w-5 h-5 right-3'
    };

    return (
      <div className={clsx('relative', fullWidth ? 'w-full' : '')}>
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            disabled={disabled}
            required={required}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Icon */}
          <div className={clsx(
            'absolute flex items-center pointer-events-none top-1/2 transform -translate-y-1/2',
            iconSizeClasses[size],
            hasError ? 'text-danger-500' : 'text-secondary-400'
          )}>
            <ChevronDown />
          </div>
        </div>

        {(error || helperText) && (
          <div className="mt-2">
            {error && (
              <p className="text-sm text-danger-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-sm text-secondary-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;