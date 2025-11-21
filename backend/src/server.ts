import { createApp } from './app';
import { ENV } from './config/env';
import { ensureAdminUser } from './services/ensure-admin';

const app = createApp();

const startServer = async () => {
  try {
    await ensureAdminUser();
  } catch (error) {
    console.error('[bootstrap] Falha ao garantir usuário admin padrão', error);
  }

  app.listen(ENV.PORT, () => {
    console.log(`🚀 API pronta em http://localhost:${ENV.PORT}`);
  });
};

startServer();
