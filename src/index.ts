import { initServer } from './app';

async function init() {
  const app = await initServer();
  app.listen(8000, function () {
    console.log('listening on port 8000');
  });
}

init();
