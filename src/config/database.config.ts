require('dotenv').config();

export default () => ({
  mongoUri: process.env.MONGO_URI,
});
