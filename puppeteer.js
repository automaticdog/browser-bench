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

  async run (creds) {
    for (const cred of creds) {
      console.log('running credentials', cred);
      await this.openBrowser(this.config);
      await this.openPage();
      await this.navigateTo(cred.entrypoint);
      await this.login(cred);
    //   await this.sortResult(cred);
      await this.closePage();
      await this.closeBrowser();
    }
    return this.returnResults();
  }

  async openBrowser (config = this.config) {
    console.log('opening browser');
    this.browser = await puppeteer.launch(config);
  }

  async openPage () {
    console.log('opening page');
    this.page = await this.browser.newPage();
  }

 async navigateTo (entrypoint) {
    console.log('navigating to entrypoint', entrypoint);
    await this.page.goto(entrypoint);
  }

  async waitForNavigation () {
    console.log('waiting for navigation');
    await this.page.waitForNavigation();
  }

  async sortResult (cred) {

  }
  
  async closePage () {
    console.log('closing page');
    await this.page.close();
  }

  async closeBrowser () {
    console.log('closing browser');
    await this.browser.close();
  }

  async login (cred) {
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

  returnResults () {
    return {
      succeeded: this.pass,
      failed: this.fail
    }
  }

}

module.exports = Test;