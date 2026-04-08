const rateLimiter = require('express-rate-limit');

exports.loginLimiter = rateLimiter({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        status: 429,
        message: "Too many login attempts, try later"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

exports.apiLimiter = rateLimiter({
    windowMs: 60 * 1000,
    max: 20,
     message: {
        status: 429,
        message: "Too many requests, slow down"
    },
    standardHeaders: true,
    legacyHeaders: false,
});