import React, { useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  placeholder?: string;
  icon?: LucideIcon;
  error?: string;
  helper?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  icon: Icon,
  error,
  helper,
  type = 'text',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 dark:text-gray-600" />
          </div>
        )}
        
        <input
          type={inputType}
          className={`
            w-full h-12 
            ${Icon ? 'pl-12' : 'pl-4'} 
            ${isPassword ? 'pr-12' : 'pr-4'} 
            bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
            rounded-2xl text-sm font-bold text-gray-700 dark:text-white
            focus:outline-none focus:border-bleu-500 dark:focus:border-or-500
            focus:ring-4 focus:ring-bleu-500/10 dark:focus:ring-or-500/10
            placeholder:text-gray-300 dark:placeholder:text-gray-600
            transition-all duration-300
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}
            ${className}
          `}
          placeholder={placeholder}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
};

export default Input;
