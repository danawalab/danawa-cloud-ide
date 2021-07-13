const { createProxyMiddleware } = require('http-proxy-middleware');

// cors 도메인 방지를 위한 중계서버 
module.exports = function (app) {
    app.use(
        createProxyMiddleware('/containers', {
            target : 'http://localhost:2375',
            changeOrigin: true
        })
    );
    app.use(
        createProxyMiddleware('/exec/*', {
            target : 'http://localhost:2375',
            changeOrigin: true
        })
    );
    app.use(
        createProxyMiddleware('/exec', {
            target : 'http://localhost:2375',
            changeOrigin: true
        })
    );
    app.use(
        createProxyMiddleware('/api/*', {
            target : 'http://localhost:4000',
            changeOrigin: true,
            secure: false
        })
    );
}