import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './config/env';
import { authRouter } from './routes/auth.routes';
import { certificatesRouter } from './routes/certificates.routes';
import { usersRouter } from './routes/users.routes';
import { swaggerDocument } from './config/swagger';

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(helmet());
  app.use(
    cors({
      origin: ENV.FRONTEND_URL,
      credentials: true
    })
  );

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use('/api/auth', authRouter);
  app.use('/api/certificates', certificatesRouter);
  app.use('/api/users', usersRouter);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  });

  return app;
};
