const puppeteer = require('puppeteer');
const staging_creds = require('./creds/staging');
const prod_creds = require('./creds/prod');

class Test {
    constructor(params) {
        this.browser = null;
        this.page = null;

        // this.url = params.url;
        this.env = params.env;
        this.roles = params.roles;

        this.passed = [];
        this.failed = [];
        // this.user = params.user;
        // this.password = params.password;
    }

    async launch() {
        this.browser = await puppeteer.launch({
            headless: false
        });
    }

    async openTab() {
        this.page = await this.browser.newPage();
    }

    async navigateTo(url) {
        await this.page.goto(url);
        await this.page.waitForTimeout(3000);
        // setTimeout(() => {
        //     console.log("waiting...");
        // }, 3000);
    }

    async login(userCreds) {
        this.page.waitForSelector('input#Username');
        console.log("typing username");
        await this.page.locator('input#Username').fill(userCreds.username);

        this.page.waitForSelector('.login-page-form-button button[type="submit"]');
        console.log("clicking Next button");
        await this.page.locator('.login-page-form-button button[type="submit"]').click();

        this.page.waitForSelector('input[type="password"]');
        console.log("typing password");
        await this.page.locator('input[type="password"]').fill(userCreds.password);

        console.log("clicking submit");
        await this.page.locator('button[type="submit"]').click();
    }

    async closeTab() {
        this.page.close();
    }

    async closeBrowser() {
        this.browser.close();
    }

    returnResults() {
        console.log(this.passed, this.failed);
        return {
            passed: this.passed,
            failed: this.failed
        }
    }

    async run() {
        let creds = [];
        let roles = [];
        
        if(this.env == 'staging') {
            creds = staging_creds[0];
        } else {
            creds = prod_creds;
        }

        const envBaseUrl = creds.baseUrl;

        for(const role of this.roles) {
            roles.push(creds.roles[role]);
        }

        for(const role of roles) {
            const entrypoints = role.entrypoints;

            for(const entrypoint of entrypoints) {
                const testUrl = envBaseUrl + entrypoint.path;
                console.log(testUrl);
                await this.launch();
                await this.openTab();
    
                console.log(`navigating to URL`);
                await this.navigateTo(testUrl);
    
                console.log(`logging in`);
                await this.login(role);
    
                await this.page.waitForNavigation();
                const finalPage = await this.page.url();
                // console.log(entrypoint.shouldHaveAccess);
                // // console.log(terminalPage);
                // // console.log(testUrl);
                if (entrypoint.shouldHaveAccess && finalPage === testUrl) {
                    console.log('great success ;^)');
                    this.passed.push({description: role.description, username: role.username, password: role.password, entrypoint: entrypoint});
                } else if (!entrypoint.shouldHaveAccess && finalPage !== testUrl) {
                    console.log('great success ;^)');
                    this.passed.push({"description": role.description, "username": role.username, "password": role.password, "entrypoint": entrypoint});
                } else if (entrypoint.shouldHaveAccess && finalPage !== testUrl) {
                    console.log("BIG FAILURE");
                    this.failed.push({"description": role.description, "username": role.username, "password": role.password, "entrypoint": entrypoint});
                } else if (!entrypoint.shouldHaveAccess && finalPage === testUrl) {
                    console.log("BIG FAILURE");
                    this.failed.push({"description": role.description, "username": role.username, "password": role.password, "entrypoint": entrypoint});
                } else {
                    console.log("something else happened");
                }
                this.closeTab();
                this.closeBrowser();
            }
        }
        return this.returnResults();
    }
}

module.exports = Test;