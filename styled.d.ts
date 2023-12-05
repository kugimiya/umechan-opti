import 'styled-components';

// расширяем дефолтные тайпинги темы
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      colorTextPrimary: string;
      colorBgPrimary: string;
      colorBgSecondary: string;
      colorButtonPrimary: string;
      colorTextLink: string;
      colorGreen: string;
    };
    mobileBreakpoint: string;
    tabletBreakpoint: string;
  }
}
