import app from "./app.js";
import config from "./config.js";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`URL Shortener base URL: ${config.app.baseUrl}`);
});
