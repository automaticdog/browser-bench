const Test = require('./puppeteer.js');
const staging_creds = require('./creds/staging.js');
const prod_creds = require('./creds/prod.js');

module.exports = (app) => {
    app.get('/', (req, res) => {
        console.log(req);
        res.send("i'm listening!");
    });

    app.post('/test', async (req, res) => {
        const env = req.body.env;
        const roles = req.body.roles;
        const test = new Test();
        if (env == 'staging') {
            console.log('running staging rules');
            console.log(roles);
            const results = await test.run(staging_creds[0], roles);
            res.send(results);
        } else if (env == 'prod') {
            console.log('running prod rules');
            console.log(roles);
            const results = await test.run(prod_creds);
            res.send(results);
        }
    });
}