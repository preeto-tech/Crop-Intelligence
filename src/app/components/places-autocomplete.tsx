import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY } from '../config';

interface PlacesAutocompleteProps {
    onSelect: (address: string) => void;
    placeholder?: string;
    defaultValue?: string;
    className?: string;
    inputClassName?: string;
    icon?: React.ReactNode;
}

export function PlacesAutocomplete({ onSelect, placeholder, defaultValue, className, inputClassName, icon }: PlacesAutocompleteProps) {
    const [value, setValue] = useState(defaultValue || '');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const autocompleteService = useRef<any>(null);
    const sessionToken = useRef<any>(null);

    useEffect(() => {
        if (defaultValue) setValue(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        const checkGoogleMaps = setInterval(() => {
            if (window.google?.maps?.places) {
                setIsGoogleLoaded(true);
                clearInterval(checkGoogleMaps);
            }
        }, 100);

        if (window.google?.maps?.places) {
            setIsGoogleLoaded(true);
            return;
        }

        const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
        if (!existingScript) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }

        return () => clearInterval(checkGoogleMaps);
    }, []);

    useEffect(() => {
        if (isGoogleLoaded && value && value.length >= 2 && value !== defaultValue) {
            fetchSuggestions(value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isGoogleLoaded]);


    const fetchSuggestions = (input: string) => {
        if (!isGoogleLoaded || !window.google?.maps?.places) {
            return;
        }

        if (!input || input.length < 2) {
            setSuggestions([]);
            return;
        }

        try {

            if (!autocompleteService.current) {
                autocompleteService.current = new window.google.maps.places.AutocompleteService();
                sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
            }

            setIsLoading(true);
            autocompleteService.current.getPlacePredictions(
                {
                    input,
                    sessionToken: sessionToken.current,
                    componentRestrictions: { country: 'in' }
                },
                (predictions: any, status: any) => {
                    setIsLoading(false);
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setSuggestions(predictions);
                        setIsOpen(true);
                    } else {
                        setSuggestions([]);
                    }
                }
            );
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setIsLoading(false);
        }
    };

    const handleSelect = (prediction: any) => {
        setValue(prediction.description);
        setIsOpen(false);
        onSelect(prediction.description);
        // Refresh session token for next search
        if (window.google) {
            sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        }
    };

    return (
        <div className={`relative ${className || ''}`}>
            <div className="relative">
                {icon || <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        fetchSuggestions(e.target.value);
                    }}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder || "Search location..."}
                    className={inputClassName || "w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium text-slate-900"}
                />
                {isLoading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 animate-spin" />
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-[9999] mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 top-full left-0">
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion.place_id}
                            type="button"
                            onClick={() => handleSelect(suggestion)}
                            className="w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors flex items-start gap-3 border-b border-slate-50 last:border-0 group"
                        >
                            <div className="mt-0.5 p-1.5 bg-slate-100 rounded-lg group-hover:bg-green-100 transition-colors">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 leading-tight mb-0.5">
                                    {suggestion.structured_formatting.main_text}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                    {suggestion.structured_formatting.secondary_text}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

declare global {
    interface Window {
        google: any;
    }
}

