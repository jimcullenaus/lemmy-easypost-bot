import LemmyBot from 'lemmy-bot';
import { config } from 'dotenv';
import { Storage } from './db/storage';
import AppConfig from './config/app-config';
import PostService from './services/post-service';

// Parse the env file if environment variables not already set
if (!process.env.LOGIN_INSTANCE_NAME
    || !process.env.USERNAME
    || !process.env.PASSWORD) {
    config({
        override: true,
        path: '.env'
    });
}

const appConfig = AppConfig.fromEnvironment();
const storage = new Storage('data/posts.json', 'data/archive.json');

const bot = new LemmyBot({
    instance: appConfig.loginInstanceName,
    credentials: {
        username: appConfig.username,
        password: appConfig.password
    },
    markAsBot: false,
    schedule: {
        cronExpression: '0 * * * * *',
        doTask: async (ref: any) => {
            const postService = new PostService(ref.botActions, appConfig.loginInstanceName, storage);
            await postService.postToLemmy();
        }
    }
});
bot.start();
// Cleanup on exit
process.on('SIGINT', () => {
  storage.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  storage.close();
  process.exit(0);
});
