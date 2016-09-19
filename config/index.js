const config = {
  mongoURL: process.env.MONGO_URL || 'mongodb://bot:Manual@localhost:27017/heartin-bot?authSource=heartin',
  port: process.env.PORT || 3978,
  token: process.env.TOKEN || 'EAANoqHvZBBckBAPS5td0KpIatcKLEL2jnflMXQTdm3XbXiP73eAnFVbBIBZAADQH8RSNwK3IoEELa4q1wkq2ZBXA7eVBHRmX25huGRRJr0NLF99NdhVAg2MKXtSTRJWs3vSmCiTZBl8qgV6RzaC4Dt7L98jy2ujZCZCOamaw1rtAZDZD',
  appId: 'heartin',
  appSecret: '71b2e204ae924a3a9f7bccaaeb834d6b'
};

export default config;
