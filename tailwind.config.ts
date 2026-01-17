import type { Config } from "tailwindcss";

const config = {
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
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // CSS Variable mappings
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
        // Spriggle Brand Colors (direct values for when needed)
        spriggle: {
          purple: {
            50: "#F5F0FF",
            100: "#EBE0FF",
            200: "#D6C2FF",
            300: "#C2A3FF",
            400: "#AD85FF",
            500: "#9966FF",
            600: "#7A52CC",
            700: "#5C3D99",
            800: "#3D2966",
            900: "#1F1433",
          },
          coral: {
            50: "#FFF5F0",
            100: "#FFEAE0",
            200: "#FFD6C2",
            300: "#FFC1A3",
            400: "#FFAD85",
            500: "#FF8866",
            600: "#CC6D52",
            700: "#99523D",
            800: "#663629",
            900: "#331B14",
          },
          teal: {
            50: "#F0FFFC",
            100: "#E0FFF9",
            200: "#C2FFF3",
            300: "#A3FFED",
            400: "#85FFE7",
            500: "#66FFE0",
            600: "#52CCB3",
            700: "#3D9987",
            800: "#29665A",
            900: "#14332D",
          },
          yellow: {
            50: "#FFFDF0",
            100: "#FFFBE0",
            200: "#FFF7C2",
            300: "#FFF3A3",
            400: "#FFEF85",
            500: "#FFEB66",
            600: "#CCBC52",
            700: "#998D3D",
            800: "#665E29",
            900: "#332F14",
          },
          cream: "#FFFDF5",
          night: "#1A1625",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.5rem",
        "2xl": "2rem",
      },
      boxShadow: {
        "primary-sm": "0 2px 8px rgba(153, 102, 255, 0.15)",
        "primary": "0 4px 14px rgba(153, 102, 255, 0.25)",
        "primary-lg": "0 8px 24px rgba(153, 102, 255, 0.35)",
        "coral": "0 4px 14px rgba(255, 136, 102, 0.25)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "twinkle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "twinkle": "twinkle 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
      },
      backgroundImage: {
        "gradient-playful": "linear-gradient(135deg, #9966FF 0%, #FF8866 50%, #66FFE0 100%)",
        "gradient-magic": "linear-gradient(135deg, #9966FF 0%, #5C3D99 100%)",
        "gradient-sunset": "linear-gradient(135deg, #FF8866 0%, #FFEB66 100%)",
        "gradient-hero": "linear-gradient(135deg, #9966FF 0%, #FF8866 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
