const redisClient = require('../config/redis');

exports.unblockedUser = async (req, res) => {
    try {
        const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }
    const attemptKey = `login:attempts:${email}`;
    const blockKey = `login:block:${email}`;

    await redisClient.del(attemptKey);
    await redisClient.del(blockKey);

        res.json({success:true, message: "User unblocked successfully" });
    } catch(err) {
        console.log('UnBlock Error: ', err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};
