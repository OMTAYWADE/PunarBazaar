const redisClient = require('../config/redis');

exports.unblockedUser = async (req, res) => {
    const { email } = req.body;
    const attemptKey = `login:attempts:${email}`;
    const blockKey = `login:block:${email}`;

    await redisClient.del(attemptKey);
    await redisClient.del(blockKey);

    res.json({ message: "User unblocked successfully" });
};
