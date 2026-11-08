import type { Config } from 'tailwindcss'

const c = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

export default <Partial<Config>>{
  content: [],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',

      action: {
        primary: {
          DEFAULT: c('action-primary'),
          hover: c('action-primary-hover'),
          pressed: c('action-primary-pressed'),
        },
        soft: c('action-soft'),
        disabled: c('action-disabled'),
        subtle: {
          hover: c('action-subtle-hover'),
          pressed: c('action-subtle-pressed'),
        },
      },

      highlight: {
        pop: {
          DEFAULT: c('highlight-pop'),
          soft: c('highlight-pop-soft'),
          text: c('highlight-pop-text'),
        },
        ai: {
          DEFAULT: c('highlight-ai'),
          soft: c('highlight-ai-soft'),
          text: c('highlight-ai-text'),
        },
      },

      status: {
        success: {
          DEFAULT: c('status-success'),
          bg: c('status-success-bg'),
          text: c('status-success-text'),
        },
        warning: {
          DEFAULT: c('status-warning'),
          bg: c('status-warning-bg'),
          text: c('status-warning-text'),
        },
        error: {
          DEFAULT: c('status-error'),
          bg: c('status-error-bg'),
          text: c('status-error-text'),
        },
        neutral: c('status-neutral'),
      },
    },

    fontFamily: {
      sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      display: ['Montserrat', 'system-ui', 'sans-serif'],
    },


    borderRadius: {
      none: '0',
      sm: '6px',
      md: '10px',
      lg: '16px',
      xl: '20px',
      full: '9999px',
    },

    extend: {
      backgroundColor: {
        canvas: c('bg-canvas'),
        surface: c('bg-surface'),
        raised: c('bg-raised'),
        sunken: c('bg-sunken'),
        inverse: c('bg-inverse'),
      },
      textColor: {
        primary: c('text-primary'),
        secondary: c('text-secondary'),
        disabled: c('text-disabled'),
        'on-inverse': c('text-on-inverse'),
        link: c('text-link'),
      },
      borderColor: {
        subtle: c('border-subtle'),
        strong: c('border-strong'),
      },
      ringColor: {
        focus: 'rgb(var(--border-focus) / 0.25)',
      },
      boxShadow: {
        card: '0 0 0 1px rgb(var(--gray-950) / 0.04), 0 1px 2px rgb(var(--gray-950) / 0.06), 0 2px 8px rgb(var(--gray-950) / 0.06)',
      },
    },
  },
  plugins: [],
}
