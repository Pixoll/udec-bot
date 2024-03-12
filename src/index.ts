import { config as dotenv } from 'dotenv';
import { client } from './client';

dotenv();

client.login();
