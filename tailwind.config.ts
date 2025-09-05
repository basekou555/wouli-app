
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Wouli Design System
				urgent: {
					DEFAULT: 'hsl(var(--urgent))',
					foreground: 'hsl(var(--urgent-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				neutral: {
					50: 'hsl(var(--neutral-50))',
					100: 'hsl(var(--neutral-100))',
					200: 'hsl(var(--neutral-200))',
					300: 'hsl(var(--neutral-300))',
					400: 'hsl(var(--neutral-400))',
					500: 'hsl(var(--neutral-500))',
					600: 'hsl(var(--neutral-600))',
					700: 'hsl(var(--neutral-700))',
					800: 'hsl(var(--neutral-800))',
					900: 'hsl(var(--neutral-900))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Instagram inspired colors
				instagram: {
					purple: '#8a3ab9',
					pink: '#e95950',
					orange: '#fcaf45',
					blue: '#5851db',
					yellow: '#fbad50',
					red: '#cd486b',
				},
				wouli: {
					'blue': '#0070F3',
					'purple': '#8A3AB9',
					'pink': '#E95950',
					'gray-50': '#F9FAFB',
					'gray-100': '#F3F4F6',
					'gray-200': '#E5E7EB',
					'gray-300': '#D1D5DB',
					'gray-800': '#1F2937',
					'gray-900': '#111827',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				'fade-up': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				'fade-down': {
					from: { opacity: '0', transform: 'translateY(-20px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				},
				'pulse-dynamic': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'50%': { transform: 'scale(1.02)', opacity: '0.9' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'slide-right': {
					'0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'translateX(100px) rotate(15deg)', opacity: '0' },
				},
				'slide-left': {
					'0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'translateX(-100px) rotate(-15deg)', opacity: '0' },
				},
				'scale': {
					from: { transform: 'scale(0.95)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' },
				},
				'scale-up': {
					from: { transform: 'scale(0.9)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' },
				},
				'slide-up-ease': {
					from: { transform: 'translateY(20px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' },
				},
				// Wouli Swipe Animations
				'swipe-left': {
					'0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'translateX(-30px) rotate(-5deg)', opacity: '0.9' },
				},
				'swipe-right': {
					'0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'translateX(30px) rotate(5deg)', opacity: '0.9' },
				},
				// Wouli Signature Animations
				'heartbeat': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'25%': { transform: 'scale(1.05)', opacity: '0.9' },
					'50%': { transform: 'scale(1.1)', opacity: '0.8' },
					'75%': { transform: 'scale(1.05)', opacity: '0.9' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'like-pop': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.3) rotate(5deg)' },
					'100%': { transform: 'scale(1) rotate(0deg)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'fade-up': 'fade-up 0.5s ease-out forwards',
				'fade-down': 'fade-down 0.4s ease-out forwards',
				'float': 'float 6s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
				'pulse-dynamic': 'pulse-dynamic 0.8s ease-out forwards',
				'slide-right': 'slide-right 0.4s ease-out forwards',
				'slide-left': 'slide-left 0.4s ease-out forwards',
				'scale': 'scale 0.3s ease-out forwards',
				'scale-up': 'scale-up 0.5s ease-out forwards',
				'slide-up-ease': 'slide-up-ease 0.4s ease-out forwards',
				// Wouli Signature Animations
				'swipe-left': 'swipe-left 0.3s ease-out',
				'swipe-right': 'swipe-right 0.3s ease-out',
				'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
				'like-pop': 'like-pop 0.4s ease-out',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
