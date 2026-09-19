import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Manual de Estilo Lua Azul - Colores Oficiales
        azul: {
          DEFAULT: '#2E4C82',
          light: '#4269ad',
          dark: '#1d345e',
          950: '#0f1c33',
        },
        // Escala completa usada en botones y acentos (mismo tono que "azul")
        lua: {
          50: '#eef2f8',
          100: '#dce6f1',
          200: '#b9cce3',
          300: '#93b0d3',
          400: '#6690bf',
          500: '#4269ad',
          600: '#2E4C82',
          700: '#253e6a',
          800: '#1d345e',
          900: '#16283f',
          950: '#0f1c33',
        },
        verde: {
          DEFAULT: '#1E5C42',
          light: '#2a7c59',
          dark: '#143d2c',
        },
        dorado: {
          DEFAULT: '#B8893A',
          light: '#d4a34f',
          dark: '#946d29',
        },
        lila: {
          DEFAULT: '#B096D6',
          light: '#cbbae4',
          dark: '#8b6ebd',
        },
        celeste: {
          DEFAULT: '#C9E1F7',
          light: '#e1f0fc',
          dark: '#a2c8f0',
        },
        // Tintes por categoría
        tinte: {
          cursos: '#BEE0D0',
          libros: '#C7D3EF',
          testimonios: '#EAD6A0',
          agendas: '#D8C9EE',
          artesanias: '#EACADC',
          varios: '#AFD3F2',
        },
      },
      fontFamily: {
        firma: ['var(--font-firma)', 'cursive'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
