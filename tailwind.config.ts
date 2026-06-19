import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1400px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'h1': ['var(--text-h1)', { lineHeight: 'var(--leading-tight)', fontWeight: '600' }],
        'h2': ['var(--text-h2)', { lineHeight: 'var(--leading-tight)', fontWeight: '600' }],
        'h3': ['var(--text-h3)', { lineHeight: 'var(--leading-normal)', fontWeight: '600' }],
        'body': ['var(--text-body)', { lineHeight: 'var(--leading-normal)' }],
        'caption': ['var(--text-caption)', { lineHeight: 'var(--leading-normal)' }],
        'kpi': ['var(--text-kpi-number)', { lineHeight: 'var(--leading-tight)', fontWeight: '700' }],
        'table-header': ['var(--text-table-header)', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.05em' }],
        'table-cell': ['var(--text-table-cell)', { lineHeight: 'var(--leading-normal)' }],
        'badge-sm': ['var(--text-badge-sm)', { lineHeight: '1', fontWeight: '500' }],
      },
      colors: {
        // Border with standardized opacity levels: /50 (subtle), /70 (default), full (strong)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        chat: {
          bg: "hsl(var(--chat-bg))",
          message: "hsl(var(--chat-message))",
          action: {
            bg: "hsl(var(--chat-action-bg))",
            border: "hsl(var(--chat-action-border))",
            hover: "hsl(var(--chat-action-hover))",
          },
          bubble: {
            ai: "hsl(var(--chat-bubble-ai))",
            "ai-foreground": "hsl(var(--chat-bubble-ai-foreground))",
            user: "hsl(var(--chat-bubble-user))",
            "user-foreground": "hsl(var(--chat-bubble-user-foreground))",
          },
          header: {
            bg: "hsl(var(--chat-header-bg))",
            foreground: "hsl(var(--chat-header-foreground))",
          },
        },
        workspace: {
          bg: "hsl(var(--workspace-bg))",
        },
        'subtab-shelf': "hsl(var(--subtab-shelf))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "prompt-appear": {
          "0%": {
            opacity: "0",
            transform: "scale(0.92) translateY(4px)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) translateY(0)",
          },
        },
        // Fade without vertical movement (for tab content transitions)
        "fade-in-flat": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "ring-ping": {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "prompt-appear": "prompt-appear 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in-flat": "fade-in-flat 0.15s ease-out",
        "ring-ping": "ring-ping 1.5s cubic-bezier(0, 0, 0.2, 1) 3",
        "marquee": "marquee 35s linear infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string | Record<string, string>>>) => void }) {
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': { width: '6px' },
        },
        '.scrollbar-thumb-border': {
          '&::-webkit-scrollbar-thumb': { 
            'background-color': 'hsl(var(--border))',
            'border-radius': '9999px',
          },
        },
        '.scrollbar-track-transparent': {
          '&::-webkit-scrollbar-track': { 'background-color': 'transparent' },
        },
      })
    }
  ],
} satisfies Config;
