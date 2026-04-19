/**
 * Возвращает правильную форму русского существительного после числа
 * @param n - Число
 * @param forms - Три формы: [1, 2, 5] например ["минута", "минуты", "минут"]
 * @returns Правильная форма слова
 *
 * @example
 * pluralize(1, ["минута", "минуты", "минут"]) // "минута"
 * pluralize(2, ["минута", "минуты", "минут"]) // "минуты"
 * pluralize(5, ["минута", "минуты", "минут"]) // "минут"
 */
export function pluralize(n: number, forms: readonly [string, string, string]): string {
  const lastTwo = n % 100;
  const lastOne = n % 10;

  if (lastTwo >= 11 && lastTwo <= 19) return forms[2];
  if (lastOne === 1) return forms[0];
  if (lastOne >= 2 && lastOne <= 4) return forms[1];
  return forms[2];
}

// Предопределённые формы для частых слов
export const MINUTES_FORMS = ["минута", "минуты", "минут"] as const;
export const SECONDS_FORMS = ["секунда", "секунды", "секунд"] as const;
export const CYCLES_FORMS = ["цикл", "цикла", "циклов"] as const;
