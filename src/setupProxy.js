const { createProxyMiddleware } = require('http-proxy-middleware');

//cors 도메인 방지를 위한 중개서버 
module.exports = function (app) {
    app.use(
        createProxyMiddleware('/containers', {
            target : '*',
            changeOrigin: true
        })
    );
}