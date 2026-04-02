const { createClient } = require('redis');

const client = createClient({
    url: "redis://localhost:6379"
});

client.on("error", (err) => console.log('redis Error', err));

(async () => {
    await client.connect();
    console.log('redis Connceted');
})();

module.exports = client;