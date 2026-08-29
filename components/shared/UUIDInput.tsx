'use client'

import { useState } from 'react'

interface UUIDInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  helpText?: string
}

export default function UUIDInput({
  label,
  value,
  onChange,
  required = false,
  placeholder = 'Enter UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)',
  helpText,
}: UUIDInputProps) {
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // Basic UUID validation
    if (newValue && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newValue)) {
      setError('Invalid UUID format')
    } else {
      setError('')
    }
  }

  return (
    <div>
      <label className="block mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-2 border rounded font-mono text-sm"
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helpText && (
        <p className="mt-1 text-sm text-gray-600">{helpText}</p>
      )}
    </div>
  )
}
