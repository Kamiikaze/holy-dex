import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import {de} from "vuetify/locale";

export default createVuetify({
  locale: {
    locale: "de",
    messages: {de}
  },
  theme: {
    defaultTheme: "holy",

    themes: {
      holy: {
        dark: true,

        colors: {
          background: "#141414",
          surface: "#1E1E1E",
          "surface-bright": "#2A2A2A",

          primary: "#FF2E8A",      // vibrant pink
          secondary: "#00D8FF",    // cyan
          accent: "#FFE600",       // neon yellow
          success: "#62FF7B",
          warning: "#FFB000",
          error: "#FF5B5B",

          info: "#64C7FF",

          text: "#FFFFFF",

          card: "#242424",
          border: "#333333",
        }
      },
    },
  },

  defaults: {

    VCard: {
      rounded: "xl",
      elevation: 8
    },

    VBtn: {
      rounded: "xl",
      elevation: 0
    },

    VTextField: {
      variant: "outlined",
      rounded: "lg"
    },

    VTextArea: {
      variant: "outlined",
      rounded: "lg"
    },

    VInput: {
      variant: "outlined",
      rounded: "lg",
    },

    VSelect: {
      variant: "outlined",
      rounded: "lg"
    },

    VChip: {
      rounded: "pill"
    }
  }
})
