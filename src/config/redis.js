const { createClient } = require('redis');

const client = createClient({
    url: process.env.REDIS_URL
});

client.on("error", (err) => console.log('redis Error', err));

(async () => {
    try {
        await client.connect();
        console.log('redis Connceted');
    } catch (err) {
        console.log("Redis failed, continuing without cache");
    }
})();

module.exports = client;