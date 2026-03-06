/**
 * Utility to manage real-time translation using Google Translate cookies.
 * Format for googtrans cookie: /en/hi (from English to Hindi)
 */

export const SUPPORTED_LANGUAGES = {
    en: { label: 'English', code: 'en' },
    hi: { label: 'हिंदी', code: 'hi' },
    ta: { label: 'தமிழ்', code: 'ta' }
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

/**
 * Gets the current language code from the googtrans cookie or defaults to 'en'.
 */
export function getCurrentLanguage(): LanguageCode {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
    if (!cookie) return 'en';

    const parts = cookie.split('/');
    const langCode = parts[parts.length - 1] as LanguageCode;

    return SUPPORTED_LANGUAGES[langCode] ? langCode : 'en';
}

/**
 * Sets the translation language by updating the googtrans cookie.
 * This triggers the Google Translate widget on the page.
 */
export function setTranslationLanguage(langCode: LanguageCode) {
    if (langCode === 'en') {
        // To revert to original (English), we clear the cookie
        const domains = [
            window.location.hostname,
            `.${window.location.hostname}`,
            'localhost',
            ''
        ];

        domains.forEach(domain => {
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${domain ? ` domain=${domain};` : ''}`;
        });
    } else {
        const value = `/en/${langCode}`;
        document.cookie = `googtrans=${value}; path=/;`;
        document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname};`;
    }

    // Refresh to apply translation (Google Translate Widget usually needs this to catch the cookie)
    window.location.reload();
}
