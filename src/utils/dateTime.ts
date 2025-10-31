export type AppLanguage = 'en' | 'es';

export function formatTimeLabel(language: AppLanguage, time: string): string {
  const locale = language === 'en' ? 'en-US' : 'es-PE';
  return new Date(`1970-01-01T${time}`).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: language === 'en',
  });
}