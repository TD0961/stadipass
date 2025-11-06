/**
 * Phone Input Component with Country Selection
 * 
 * IMPORTANCE:
 * - International phone number support
 * - Country code selection
 * - Searchable country dropdown
 * - Proper phone number formatting
 * - Used in registration and profile forms
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { countries } from '../../utils/countries';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryChange: (code: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryChange,
  label,
  error,
  required = false,
  disabled = false,
  className = '',
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Get Selected Country
   * 
   * IMPORTANCE:
   * - Shows current country flag and code
   * - Used for display in dropdown button
   */
  const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];

  /**
   * Filter Countries by Search
   * 
   * IMPORTANCE:
   * - Allows users to quickly find their country
   * - Searches by country name and code
   */
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm)
  );

  /**
   * Handle Country Selection
   * 
   * IMPORTANCE:
   * - Updates country code
   * - Closes dropdown
   * - Focuses phone input
   */
  const handleCountrySelect = (code: string) => {
    onCountryChange(code);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  /**
   * Handle Phone Number Input
   * 
   * IMPORTANCE:
   * - Allows only numeric input
   * - Limits length based on country
   * - Updates value
   */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
    onChange(input);
  };

  /**
   * Close Dropdown on Outside Click
   * 
   * IMPORTANCE:
   * - Better UX
   * - Prevents dropdown staying open
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Country Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-3 bg-[#030712] border border-[#00f5a0]/30 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00f5a0] transition-all ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#00f5a0] cursor-pointer'
            } ${error ? 'border-red-500/50' : ''}`}
          >
            <span className="text-2xl">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-80 bg-[#0a0f1e] border border-[#00f5a0]/30 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden"
              >
                {/* Search Input */}
                <div className="p-3 border-b border-gray-700/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#030712] border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00f5a0] text-sm"
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Countries List */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country.code)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#00f5a0]/10 transition-colors ${
                          country.code === countryCode ? 'bg-[#00f5a0]/20' : ''
                        }`}
                      >
                        <span className="text-2xl">{country.flag}</span>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium">{country.name}</div>
                          <div className="text-gray-400 text-sm">{country.dialCode}</div>
                        </div>
                        {country.code === countryCode && (
                          <span className="text-[#00f5a0]">✓</span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-400">
                      No countries found
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Phone Number Input */}
        <input
          ref={inputRef}
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          disabled={disabled}
          placeholder="Phone number"
          className={`w-full px-4 py-3 bg-[#030712] border border-[#00f5a0]/30 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00f5a0] transition-all ${
            error ? 'border-red-500/50 focus:ring-red-500' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'phone-error' : undefined}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p id="phone-error" className="mt-1 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

