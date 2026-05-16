import webpush from 'web-push';
import { env } from '../config/env';

if (env.vapidPublicKey && env.vapidPrivateKey) {
  webpush.setVapidDetails(
    `mailto:soporte@localwork.com`, // Puede ser cualquier email
    env.vapidPublicKey,
    env.vapidPrivateKey
  );
}

export default webpush;
