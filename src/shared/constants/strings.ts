/**
 * Russian UI Strings
 * All user-facing text for the application
 */

// Navigation & Pages
export const STRINGS = {
  // App
  app_title: 'Lattice',
  app_subtitle: 'Честный математический инструмент',

  // Navigation
  nav_lottery_selection: 'Выбор лотереи',
  nav_lottery_detail: 'Детали лотереи',
  nav_strategy: 'Стратегия',
  nav_generation: 'Генерация',
  nav_simulation: 'Симуляция',
  nav_about: 'О приложении',

  // Lottery Selection
  lottery_select_title: 'Выберите лотерею',
  lottery_select_desc: 'Поддерживаемые российские лотереи',
  lottery_coming_soon: 'Скоро',
  lottery_details: 'Подробнее',

  // Lottery Names
  lottery_8_20_1: '8 из 20 + 1 из 4',
  lottery_4_20_2: '4 из 20 (два поля)',
  lottery_12_24: '12 из 24',
  lottery_5_36_1: '5 из 36 + 1',
  lottery_6_45: '6 из 45',
  lottery_6_49: '6 из 49',

  // Lottery Detail
  detail_prize_table: 'Таблица выигрышей',
  detail_ev: 'Математическое ожидание',
  detail_probability: 'Вероятность выигрыша',
  detail_cost: 'Стоимость билета',
  detail_superprice: 'Суперприз',
  detail_avg_pool: 'Средний призовой фонд',
  detail_matched: 'Угадано',

  // Strategy
  strategy_title: 'Выберите стратегию',
  strategy_min_risk: 'Минимальный риск',
  strategy_coverage: 'Максимальное покрытие',
  strategy_full_wheel: 'Полное колесо',
  strategy_key_wheel: 'Ключевое колесо',
  strategy_guaranteed: 'Гарантированный выигрыш',
  strategy_budget: 'Оптимизация по бюджету',

  strategy_min_risk_desc: 'Максимизировать вероятность минимального выигрыша',
  strategy_coverage_desc: 'Максимальное покрытие комбинаций при фиксированном бюджете',
  strategy_full_wheel_desc: 'Все комбинации выбранных чисел',
  strategy_key_wheel_desc: 'Сокращённое колесо с фиксированными ключевыми числами',
  strategy_guaranteed_desc: 'Гарантирует выигрыш при любом раскладе',
  strategy_budget_desc: 'Максимизировать ожидаемую стоимость при бюджете',

  // Generation
  generation_title: 'Генерация билетов',
  generation_count: 'Количество билетов',
  generation_cost: 'Общая стоимость',
  generation_coverage: 'Покрытие комбинаций',
  generation_tickets: 'Билеты',
  generation_download_pdf: 'Скачать PDF',
  generation_copy: 'Копировать',

  // Simulation
  simulation_title: 'Симуляция игры',
  simulation_draws: 'Количество тиражей',
  simulation_run: 'Запустить симуляцию',
  simulation_results: 'Результаты',
  simulation_total_cost: 'Общие затраты',
  simulation_total_wins: 'Общие выигрыши',
  simulation_roi: 'ROI',
  simulation_history: 'История тиражей',

  // Common
  button_next: 'Далее',
  button_back: 'Назад',
  button_submit: 'Подтвердить',
  button_cancel: 'Отмена',
  button_reset: 'Сброс',
  button_download: 'Скачать',
  button_share: 'Поделиться',

  // Errors & Validation
  error_title: 'Ошибка',
  error_invalid_params: 'Неверные параметры',
  error_invalid_lottery: 'Неверная лотерея',
  error_invalid_strategy: 'Неверная стратегия',
  error_generation_failed: 'Ошибка генерации',
  error_try_again: 'Попробуйте снова',

  // Success
  success_generated: 'Билеты успешно сгенерированы',
  success_copied: 'Скопировано в буфер обмена',
  success_downloaded: 'Файл скачан',

  // Info
  info_no_guarantee: 'Нет гарантии выигрыша',
  info_expected_value: 'Ожидаемое значение составляет',
  info_probability: 'Вероятность выигрыша составляет',
  info_coverage: 'Покрыто комбинаций',
} as const;

// Export type for strict typing
export type StringKey = keyof typeof STRINGS;
