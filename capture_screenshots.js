const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture() {
  console.log("Launching Edge...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  console.log("Navigating to app...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await delay(1000);

  // 1. Login Screen
  await page.screenshot({ path: path.join(dir, '1_login_screen.png') });
  console.log("✅ Captured login screen");

  // 2. Register Screen
  await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll('button, a, p span')).find(el => el.textContent.includes('Create one') || el.textContent.includes('Register'));
    if (link) link.click();
  });
  await delay(1000);
  await page.screenshot({ path: path.join(dir, '2_register_screen.png') });
  console.log("✅ Captured register screen");

  // Go back to login
  await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll('button, a, p span')).find(el => el.textContent.includes('Sign in') || el.textContent.includes('Log in'));
    if (link) link.click();
  });
  await delay(500);

  // Login
  console.log("Logging in...");
  await page.type('input[type="email"]', 'testuser@test.com');
  await page.type('input[type="password"]', 'password123');
  
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Sign In') || el.textContent.includes('Login'));
    if (btn) btn.click();
  });
  
  await delay(3000); // wait for login to complete

  // 3. Dashboard Screen
  await page.screenshot({ path: path.join(dir, '3_dashboard_screen.png') });
  console.log("✅ Captured dashboard screen");

  // 4. Account Screen
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.sidebar-nav li, button, a'));
    const btn = links.find(el => el.textContent.includes('Account'));
    if (btn) btn.click();
  });
  await delay(1000);
  await page.screenshot({ path: path.join(dir, '4_account_screen.png') });
  console.log("✅ Captured account screen");

  // 5. Assessment Screen
  // Go back to dashboard first to find 'Take Assessment' or use sidebar
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.sidebar-nav li, button, a'));
    const btn = links.find(el => el.textContent.includes('Dashboard'));
    if (btn) btn.click();
  });
  await delay(500);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a, .action-card'));
    const btn = btns.find(el => el.textContent.includes('Take Assessment'));
    if (btn) btn.click();
  });
  await delay(1000);
  await page.screenshot({ path: path.join(dir, '5_assessment_screen.png') });
  console.log("✅ Captured assessment screen");

  // 6. Results Screen
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.sidebar-nav li, button, a'));
    const btn = links.find(el => el.textContent.includes('Dashboard'));
    if (btn) btn.click();
  });
  await delay(500);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a, .action-card, .profile-card'));
    const btn = btns.find(el => el.textContent.includes('View Profile') || el.querySelector?.('.dosha-primary'));
    if (btn) btn.click();
  });
  await delay(1000);
  await page.screenshot({ path: path.join(dir, '6_results_screen.png') });
  console.log("✅ Captured results screen");

  // 7. Chat Screen
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.sidebar-nav li, button, a'));
    const btn = links.find(el => el.textContent.includes('New Consultation') || el.textContent.includes('Chat'));
    if (btn) btn.click();
  });
  await delay(1000);
  await page.screenshot({ path: path.join(dir, '7_chat_screen.png') });
  console.log("✅ Captured chat screen");

  await browser.close();
  console.log("🎉 All screenshots captured successfully in /screenshots folder!");
}

capture().catch(err => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
