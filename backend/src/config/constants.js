import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  TELEGRAM: {
    TOKEN: process.env.TELEGRAM_BOT_TOKEN
  },
  QWEN: {
    API_KEY: process.env.QWEN_API_KEY,
    BASE_URL: process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  },
  TAVILY: {
    API_KEY: process.env.TAVILY_API_KEY
  },
  BITGET: {
    API_KEY: process.env.BITGET_API_KEY,
    SECRET_KEY: process.env.BITGET_SECRET_KEY,
    PASSPHRASE: process.env.BITGET_PASSPHRASE,
    API_URL: process.env.BITGET_API_URL || 'https://api.bitget.com'
  },
  MULERUN: {
    API_KEY: process.env.MULERUN_API_KEY
  }
};

// Validate that crucial keys are loaded
const requiredKeys = [
  'TELEGRAM.TOKEN',
  'QWEN.API_KEY',
  'TAVILY.API_KEY',
  'BITGET.API_KEY',
  'BITGET.SECRET_KEY',
  'BITGET.PASSPHRASE'
];

requiredKeys.forEach(keyPath => {
  const keys = keyPath.split('.');
  let value = CONFIG;
  for (const k of keys) {
    value = value[k];
  }
  if (!value) {
    console.warn(`[WARNING] Missing critical configuration: ${keyPath}`);
  }
});