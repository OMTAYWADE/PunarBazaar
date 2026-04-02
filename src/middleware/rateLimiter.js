const rateLimiter = require('express-rate-limit');

exports.loginLimiter = rateLimiter({
    windowMs: 60 * 1000,
    max: 5,
    message: "Too many login attempts, try later"
});

exports.apiLimiter = rateLimiter({
    windowMs: 60 * 1000,
    max: 20,
    message: "Too many request"
});