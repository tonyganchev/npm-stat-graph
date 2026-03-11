import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    disabled: boolean;
    style?: React.CSSProperties;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ value, onChange, placeholder, disabled, style }) => {
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
                const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(value)}&size=5`);
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
        <div ref={wrapperRef} style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <input
                type="text"
                className="input"
                style={{ width: '100%', ...style }}
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
            />
            {showSuggestions && suggestions.length > 0 && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                    borderRadius: '0.5rem', marginTop: '0.25rem', overflow: 'hidden', backdropFilter: 'blur(12px)'
                }}>
                    {suggestions.map((s, i) => (
                        <div
                            key={i}
                            style={{
                                padding: '0.5rem 1rem', cursor: 'pointer', color: 'var(--text-primary)',
                                background: 'transparent'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
