const Test = require('./puppeteer.js')
const creds = require('./creds/staging.js')

module.exports = (app) => {
    app.get('/', (req, res) => {
        console.log(req);
        res.send("i'm listening!");
    });

    app.post('/test', async (req, res) => {
        const test = new Test();
        const results = await test.run(creds);
        console.log(results);
        res.send(results);
    });
}