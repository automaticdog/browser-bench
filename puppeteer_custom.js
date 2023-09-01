const puppeteer = require('puppeteer');

class CustomTest {
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

  async run (user, password, endpoints) {
    for (const endpoint of endpoints) {
        const url = endpoint.url;
        const shouldHaveAccess = endpoint.shouldHaveAccess;

        await this.openBrowser(this.config);
        console.log('browser instance opened')
        await this.openPage();
        console.log('page opened')
        await this.navigateTo(url);
        console.log(`navigated to ${url}`)
        await this.login(user, password);
        console.log('successfully logged in')
        console.log('waiting for navigation');
        await this.waitForNavigation()
        console.log('validating results...');
        await this.validateResult(url, shouldHaveAccess);
        console.log('closing page');
        await this.closePage();
        console.log('closing browser session');
        await this.closeBrowser();
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

  async validateResult (url, shouldHaveAccess) {
    const finalUrl = await this.page.url();
    if (shouldHaveAccess && finalUrl == url) {
        this.pass.push({url});
        console.log('expected url: ', url)
        console.log('ended on url:', finalUrl)
        console.log('PASS')
    } else if (!shouldHaveAccess && finalUrl !== url) {
        this.pass.push(url);
        console.log('expected url: ', url)
        console.log('ended on url:', finalUrl)
        console.log('PASS')
    } else if (!shouldHaveAccess && finalUrl == url) {
        this.fail.push(url);
        console.log('expected url: ', url)
        console.log('ended on url:', finalUrl)
        console.log('FAIL')
    } else if (shouldHaveAccess && finalUrl !== url) {
        console.log('expected url: ', url)
        console.log('ended on url:', finalUrl)
        console.log('FAIL')
        this.fail.push(url);
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
  async login (user, password) {
    this.page.waitForSelector('input#Username');
    console.log("typing username");
    await this.page.locator('input#Username').fill(user);

    this.page.waitForSelector('.login-page-form-button button[type="submit"]');
    console.log("clicking Next button");
    await this.page.locator('.login-page-form-button button[type="submit"]').click();

    this.page.waitForSelector('input[type="password"]');
    console.log("typing password");
    await this.page.locator('input[type="password"]').fill(password);

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

module.exports = CustomTest;