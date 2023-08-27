declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      BOARD_BACKEND_API_PATH: string;
      BOARD_API_PATH: string;
    }
  }
}

export { };
