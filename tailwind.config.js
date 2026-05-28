tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#914540", "on-primary": "#ffffff", "primary-container": "#b05c57",
        "primary-fixed": "#ffdad7", "primary-fixed-dim": "#ffb3ad", "on-primary-fixed": "#3d0507", "on-primary-fixed-variant": "#77302d", "on-primary-container": "#fffbff", "inverse-primary": "#ffb3ad",
        "secondary": "#615e5b", "on-secondary": "#ffffff", "secondary-container": "#e8e1de", "secondary-fixed": "#e8e1de", "secondary-fixed-dim": "#cbc5c3", "on-secondary-fixed": "#1d1b1a", "on-secondary-fixed-variant": "#494644", "on-secondary-container": "#686461",
        "tertiary": "#5f5a65", "on-tertiary": "#ffffff", "tertiary-container": "#78727e", "tertiary-fixed": "#e7e0ed", "tertiary-fixed-dim": "#cbc4d0", "on-tertiary-fixed": "#1d1a23", "on-tertiary-fixed-variant": "#49454f", "on-tertiary-container": "#fffbff",
        "surface": "#fff8f7", "surface-dim": "#e6d7d5", "surface-bright": "#fff8f7", "surface-variant": "#efdfdd", "surface-tint": "#944742",
        "surface-container": "#faeae9", "surface-container-low": "#fff0ef", "surface-container-high": "#f4e5e3", "surface-container-highest": "#efdfdd", "surface-container-lowest": "#ffffff",
        "on-surface": "#221a19", "on-surface-variant": "#544341", "on-background": "#221a19",
        "background": "#fff8f7", "outline": "#877270", "outline-variant": "#dac1bf",
        "error": "#ba1a1a", "on-error": "#ffffff", "error-container": "#ffdad6", "on-error-container": "#93000a",
        "inverse-surface": "#372e2d", "inverse-on-surface": "#fdedeb"
      },
      borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
      spacing: { "container-padding": "24px", "unit": "4px", "section-margin": "40px", "stack-gap": "16px", "card-padding": "20px" },
      fontFamily: {
        "body-lg": ["Inter"], "body-md": ["Inter"], "sub-label": ["Inter"],
        "display-italic": ["Playfair Display"], "display-italic-mobile": ["Playfair Display"], "section-label": ["Playfair Display"],
        "accent-quote": ["Libre Caslon Text"], "cormorant": ["Cormorant Garamond"]
      },
      fontSize: {
        "body-lg": ["16px", { lineHeight: "1.6", letterSpacing: "0.01em", fontWeight: "500" }],
        "body-md": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "sub-label": ["12px", { lineHeight: "1.4", letterSpacing: "0.05em", fontWeight: "500" }],
        "display-italic": ["34px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-italic-mobile": ["28px", { lineHeight: "1.2", fontWeight: "700" }],
        "section-label": ["20px", { lineHeight: "1.4", fontWeight: "400" }],
        "accent-quote": ["18px", { lineHeight: "1.5", fontWeight: "400" }]
      }
    }
  }
};
