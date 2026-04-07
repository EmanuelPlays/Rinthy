import { en } from './en';
import { ru } from './ru';
import { de } from './de';
import { it } from './it';

export const TRANSLATIONS = {
  en,
  ru,
  de,
  it
} as const;

export type Language = keyof typeof TRANSLATIONS;
export type TranslationKey = keyof typeof en;

export const DEFAULT_LANGUAGE: Language = 'en';

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano' }

] as const satisfies ReadonlyArray<{
  code: Language;
  label: string;
  nativeLabel: string;
}>;

export const isSupportedLanguage = (value: string): value is Language => value in TRANSLATIONS;

// Add a new language:
// 1. Create `locales/<code>.ts` with the same keys as `en.ts`
// 2. Import it above and register it in `TRANSLATIONS`
// 3. Add one entry to `LANGUAGE_OPTIONS`
