import app from "./app";
import config from "./config";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`URL Shortener base URL: ${config.app.baseUrl}`);
});
