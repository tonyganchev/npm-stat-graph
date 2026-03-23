/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { useState, useEffect, useRef, CSSProperties } from 'react';

interface AutocompleteInputProps {
    value: string;
    onChange: (val: string) => void;
    onBlur?: () => void;
    placeholder: string;
    disabled: boolean;
    style?: CSSProperties;
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
                const baseUrl = 'https://registry.npmjs.org/-/v1/search';
                const res = await fetch(`${baseUrl}?text=${encodeURIComponent(value)}&size=5`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.objects) {
                        setSuggestions(data.objects.map((obj: { package: { name: string } }) => obj.package.name));
                    }
                }
            } catch {
                // Ignore silent errors for autocomplete
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
                    if (suggestions.length > 0) {
                        setShowSuggestions(true);
                    }
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
