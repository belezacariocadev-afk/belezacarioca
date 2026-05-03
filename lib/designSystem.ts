// lib/designSystem.ts
export const colors = {
  purple: '#7854a2',
  purpleStrong: '#5f3f86',
  gold: '#d8b27b',
  goldStrong: '#c79b5c',
  bg: '#fbf7f2',
  text: '#241a35',
  muted: '#6f627d',
};

export const shadows = {
  xs: '0 2px 4px rgba(110,84,144,0.04)',
  sm: '0 8px 16px rgba(110,84,144,0.06)',
  md: '0 16px 34px rgba(110,84,144,0.08)',
  lg: '0 24px 60px rgba(110,84,144,0.1)',
  xl: '0 26px 70px rgba(106,79,144,0.1)',
};

export const borders = {
  light: 'rgba(120,84,162,0.1)',
  medium: 'rgba(120,84,162,0.18)',
  gold: 'rgba(216,178,123,0.2)',
};

export const gradients = {
  card: 'linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,240,233,0.94))',
  premium: 'linear-gradient(135deg,rgba(120,84,162,0.1),rgba(216,178,123,0.1))',
};

export const cardClasses = {
  base: `border border-[${borders.light}] bg-[${gradients.card}] shadow-[${shadows.md}]`,
  hover: `hover:shadow-[${shadows.lg}] hover:border-[${borders.medium}] hover:-translate-y-1 transition-all duration-300`,
  premium: `bg-[${gradients.premium}] border-[${borders.gold}] shadow-[${shadows.lg}]`,
};

export const buttonClasses = {
  primary: `bg-[${colors.purple}] text-white hover:bg-[${colors.purpleStrong}] shadow-[${shadows.sm}] hover:shadow-[${shadows.md}]`,
  secondary: `bg-[${colors.gold}] text-[${colors.text}] hover:bg-[${colors.goldStrong}] shadow-[${shadows.sm}] hover:shadow-[${shadows.md}]`,
  base: 'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-2 focus:outline-offset-2 focus:outline-[${colors.purple}]',
};