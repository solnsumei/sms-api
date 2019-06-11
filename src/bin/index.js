import http from require('http');
import dotenv from 'dotenv';
import app from '../app';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

http.createServer(app.callback()).listen(PORT);
