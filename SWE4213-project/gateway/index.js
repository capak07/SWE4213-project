const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:3002';
const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || 'http://localhost:3003';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const REC_SERVICE_URL = process.env.REC_SERVICE_URL || 'http://localhost:3004';

app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Gateway is running' });
});

app.use('/api/books', createProxyMiddleware({
    target: BOOK_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/books': '/books' },
}));

app.use('/api/reviews', createProxyMiddleware({
    target: REVIEW_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/reviews': '/reviews' },
}));

app.use('/api/auth', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/auth' },
}));

app.use('/api/users', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/users' },
}));

app.use('/api/userBooks', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/userBooks': '/userBooks' },
}));

app.use('/api/progress', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/progress': '/progress' },
}));

app.use('/api/rec', createProxyMiddleware({
    target: REC_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/rec': '/rec' },
}));

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
