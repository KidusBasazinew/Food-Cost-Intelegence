import { createServer } from "node:http";

import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { logger } from "./config/logger.js";

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  logger.info(
    `API listening on http://localhost:${env.PORT} (env=${env.NODE_ENV})`,
  );
});
