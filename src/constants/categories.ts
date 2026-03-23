export const CATEGORIES = [
  'GENERAL',
  'SPORTS',
  'MUSIC',
  'TECH',
  'FOOD',
  'MOVIES',
  'POLITICS',
  'SCIENCE',
  'GAMING',
  'OTHER',
] as const

export type Category = typeof CATEGORIES[number]
