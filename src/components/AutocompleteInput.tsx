import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteInputProps {
    value: string;
    onChange: (val: string) => void;
    onBlur?: () => void;
    placeholder: string;
    disabled: boolean;
    style?: React.CSSProperties;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ value, onChange, onBlur, placeholder, disabled, style }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!value.trim() || value.length < 2) {
                setSuggestions([]);
                return;
            }

            try {
                // Use dev proxy for search requests to enable caching
                const baseUrl = import.meta.env?.DEV ? '/api/search' : 'https://registry.npmjs.org/-/v1/search';
                const res = await fetch(`${baseUrl}?text=${encodeURIComponent(value)}&size=5`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.objects) {
                        setSuggestions(data.objects.map((obj: any) => obj.package.name));
                    }
                }
            } catch (err) {
                // Ignore silent errors for autocomplete
            } finally {

            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [value]);

    return (
        <div ref={wrapperRef} className="autocomplete-wrapper">
            <input
                type="text"
                className="input pkg-input"
                style={style}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setShowSuggestions(true);
                }}
                disabled={disabled}
                onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={onBlur}
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="autocomplete-dropdown">
                    {suggestions.map((s, i) => (
                        <div
                            key={i}
                            className="autocomplete-item"
                            onClick={() => {
                                onChange(s);
                                setShowSuggestions(false);
                            }}
                        >
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
