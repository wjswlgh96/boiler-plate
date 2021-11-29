const { createProxyMiddleware } = require("http-proxy-middleware");

const apiProxy = createProxyMiddleware("/api", {
  target: "http://localhost:4000",
  changeOrigin: true,
});

module.exports = function (app) {
  app.use(apiProxy);
};
