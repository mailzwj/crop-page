const fs = require('fs');

const Koa = require('koa');
const Router = require('koa-router');
const puppeteer = require('puppeteer');

const app = new Koa();
const route = new Router();

route.get('/crop', async (ctx) => {
    const query = ctx.query || {};
    const { src = '', renderWidth = 1366, x = 0, y = 0, width = 640, height =  640, holdTime = 0, fullscreen = false } = query;
    const tmpPath = `./tmp-${new Date().getTime()}.png`;
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
            width: +renderWidth,
            height: 1080
        },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(src, {
        waitUntil: 'networkidle0'
    });
    const config = {
        path: tmpPath
    };
    if (fullscreen) {
        config.fullPage = true;
    } else {
        config.clip = {
            x: +x,
            y: +y,
            width: +width,
            height: +height
        };
    }
    if (holdTime > 0) {
        await new Promise((resolve) => {
            setTimeout(async () => {
                await page.screenshot(config);
                resolve(page);
            }, holdTime * 1000);
        });
    } else {
        await page.screenshot(config);
    }
    await browser.close();
    fs.chmodSync(tmpPath, 777);
    const imgData = fs.readFileSync(tmpPath);
    fs.unlinkSync(tmpPath);
    ctx.type = 'image/png';
    ctx.body = imgData;
});

app.use(route.routes())
    .use(route.allowedMethods())
    .listen('3002');

console.log('Server is running at: 127.0.0.1:3002');
