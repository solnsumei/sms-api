import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from './config';

const initDb = () => {
  dotenv.config();
  const env = process.env.NODE_ENV || 'development';

  const dbConfig = config[env];

  mongoose.connect(process.env[dbConfig.use_env_variable],
    { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false })
    .then(() => {
      if (env === 'development') {
        console.log('Database connection established');
      }
    },
      err => console.log(err)
    );
}

export default initDb;
