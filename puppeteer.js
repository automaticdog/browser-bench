const puppeteer = require('puppeteer');

class Test {
  constructor (params) {
    this.browser = null;
    this.page = null;
    this.config = {
      args: ["--no-sandbox", "--enable-gpu"],
      headless: false,
      ignoreHTTPSErrors: true,
      waitUntil: "networkidle2"
    };
    this.pass = [];
    this.fail = [];
  }

  async run (env, roles_list) {
    const baseUrl = env["baseUrl"];
    // console.log('environment variables: ', env);
    // console.log('requested roles: ', roles_list);

    for (const role of roles_list) {
        console.log('current role: ', role);
        for (const user of env.roles[role]) {
            for (const entrypoint of user.entrypoints) {
                const testUrl = baseUrl + entrypoint.path;
                await this.openBrowser(this.config);
                console.log('browser instance opened')
                await this.openPage();
                console.log('page opened')
                await this.navigateTo(testUrl);
                console.log(`navigated to ${testUrl}`)
                await this.login(user);
                console.log(`successfully logged in with ${user.description} user`)
                console.log('waiting for navigation');
                await this.waitForNavigation()
                console.log('validating results...');
                await this.validateResult(user, testUrl, entrypoint.shouldHaveAccess);
                console.log('closing page');
                await this.closePage();
                console.log('closing browser session');
                await this.closeBrowser();
            }
        }
      }
    return this.returnResults();
  }

  // call these 4 functions for each entrypoint we want to test
  async openBrowser (config = this.config) {
    console.log('opening browser');
    this.browser = await puppeteer.launch(config);
  }

  async openPage () {
    console.log('opening page');
    this.page = await this.browser.newPage();
  }

 async navigateTo (entrypoint) {
    await this.page.goto(entrypoint);
  }

  async waitForNavigation () {
    await this.page.waitForNavigation();
  }
  // ----------------

  async validateResult (user, url, shouldHaveAccess) {
    const finalUrl = await this.page.url();
    if (finalUrl == url && shouldHaveAccess) {
        this.pass.push({"user": user.username, "description": user.description});
    } else if (finalUrl !== url && !shouldHaveAccess) {
        this.pass.push({"user": user.username, "description": user.description, "failingEntrypoint": url, "shouldHaveAccess": shouldHaveAccess});
    } else if (finalUrl == url && !shouldHaveAccess) {
        this.fail.push({"user": user.username, "description": user.description, "failingEntrypoint": url, "shouldHaveAccess": shouldHaveAccess});
    } else if (finalUrl !== url && shouldHaveAccess) {
        this.fail.push({"user": user.username, "description": user.description, "failingEntrypoint": url, "shouldHaveAccess": shouldHaveAccess});
    } else {
        console.log("something unexpected happened :/")
    }
  }
  
  async closePage () {
    console.log('closing page');
    await this.page.close();
  }

  async closeBrowser () {
    console.log('closing browser');
    await this.browser.close();
  }

  // pass creds from environment user and complete the login,
  // then wait for navigation to terminal URL
  async login (user) {
    this.page.waitForSelector('input#Username');
    console.log("typing username");
    await this.page.locator('input#Username').fill(user.username);

    this.page.waitForSelector('.login-page-form-button button[type="submit"]');
    console.log("clicking Next button");
    await this.page.locator('.login-page-form-button button[type="submit"]').click();

    this.page.waitForSelector('input[type="password"]');
    console.log("typing password");
    await this.page.locator('input[type="password"]').fill(user.password);

    console.log("clicking submit");
    await this.page.locator('button[type="submit"]').click();
  }

  returnResults () {
    return {
      succeeded: this.pass,
      failed: this.fail
    }
  }

}

module.exports = Test;