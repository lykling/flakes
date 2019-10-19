/**
 * Copyright (C) 2019 All rights reserved.
 *
 * @file srv.js
 * @author Pride Leong<lykling.lyk@gmail.com>
 */

import Koa from 'koa';
import Router from 'koa-router';
// import bodyParser from 'koa-bodyparser';
import fs from 'fs';
import util from 'util';
import stream from 'stream';

const router = new Router();

// router.post('/*', bodyParser({}));

router.post('/upload', async (ctx, next) => {
    const tmp = fs.createWriteStream('./file.tmp');
    console.log(`content-length: ${ctx.headers['content-length']}`);
    // stream.Readable.from(JSON.stringify(ctx.request.body)).pipe(tmp);
    ctx.req.pipe(tmp);
    await util.promisify(stream.finished)(tmp);
    Object.assign(ctx, {resp: {
        code: 0,
        message: 'upload successfuly'
    }});
    await next();
});
router.use('/*', async (ctx, next) => {
    ctx.status = 200;
    ctx.body = ctx.resp;
});

const app = new Koa();

app.keys = ['test'];
app.use(router.routes(), router.allowedMethods());
app.listen(8005, () => {
    console.log(`listen at ${8805}`);
});
