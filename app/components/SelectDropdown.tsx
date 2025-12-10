"use client";

import { ChevronDown } from "lucide-react";

interface SelectOption {
  codigo: string;
  descricao: string;
}

interface SelectDropdownProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SelectDropdown({
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  className = "",
  disabled = false,
}: SelectDropdownProps) {
  return (
    <div className="relative">
      <select
        className={`border border-gray-300 px-3 py-2 rounded-lg w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent transition-colors h-[42px] appearance-none bg-white cursor-pointer pr-10 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.codigo} value={option.codigo}>
            {option.codigo} - {option.descricao}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none ${
          disabled ? "opacity-50" : ""
        }`}
      />
    </div>
  );
}
