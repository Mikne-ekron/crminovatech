import { createVuetify } from 'vuetify';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

import { BLUE_THEME } from '@/theme/LightTheme';
import {
  DARK_BLUE_THEME,
  DARK_AQUA_THEME,
  DARK_ORANGE_THEME,
  DARK_PURPLE_THEME,
  DARK_GREEN_THEME,
  DARK_CYAN_THEME
} from '@/theme/DarkTheme';
import { COMPANY_THEMES } from '@/theme/CompanyThemes';

export default createVuetify({
  theme: {
    defaultTheme: 'INOVATECH_DARK',
    themes: {
      BLUE_THEME,
      DARK_BLUE_THEME,
      DARK_AQUA_THEME,
      DARK_ORANGE_THEME,
      DARK_PURPLE_THEME,
      DARK_GREEN_THEME,
      DARK_CYAN_THEME,
      ...COMPANY_THEMES
    }
  },
  defaults: {
    VCard: {
      rounded: 'md',
      elevation: 10
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VListItem: {
      minHeight: '45px'
    },
    VTooltip: {
      location: 'top'
    },
  }
});
