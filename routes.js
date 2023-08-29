const Test = require('./puppeteer.js')

module.exports = (app) => {
    app.get('/', (req, res) => {
        console.log(req);
        res.send("i'm listening!");
    });

    app.post('/test', async (req, res) => {
        // const url = req.body.url;
        const test = new Test(req.body);
        const results = await test.run();
        console.log(results);
        res.send(results);
    });
}