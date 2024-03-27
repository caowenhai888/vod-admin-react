const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/',
    createProxyMiddleware({
      target: 'http://10.95.129.115:81',
      changeOrigin: true,
  
    })
  );
};