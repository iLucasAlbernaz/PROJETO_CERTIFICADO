import { createApp } from './app';
import { ENV } from './config/env';

const app = createApp();

app.listen(ENV.PORT, () => {
  console.log(`🚀 API pronta em http://localhost:${ENV.PORT}`);
});
