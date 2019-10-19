/**
 * Copyright (C) 2019 All rights reserved.
 *
 * @file cli.js
 * @author Pride Leong<lykling.lyk@gmail.com>
 */

import fs from 'fs';
import stream from 'stream';
import util from 'util';
import axios from 'axios';

// Transform to base64
const b64Transformer = new stream.Transform({
    transform(chunk, encoding, cb) {
        const buf = Buffer.concat([
            this.remain ? this.remain : Buffer.alloc(0),
            chunk
        ]);
        const sep = buf.length - buf.length % 3;
        this.remain = buf.slice(sep);
        cb(null, buf.slice(0, sep).toString('base64'));
    },
    flush(cb) {
        if (this.remain && this.remain.length) {
            // Flush last chunk
            this.push(this.remain.toString('base64'));
        }
        cb();
    }
});

// Wrap as json
const wrapTransformer = new stream.Transform({
    transform(chunk, encoding, cb) {
        if (this._wraped == null) {
            // 23 Bytes
            this.push('{"userid": 1, "data": "');
            this._wraped = true;
        }
        cb(null, chunk);
    },
    flush(cb) {
        if (this._wraped) {
            // 2 Bytes
            this.push('"}');
        }
        cb();
    }
});


async function main() {

    const input = fs.createReadStream('./README.md');
    const stat = fs.statSync('./README.md');

    const finished = util.promisify(stream.finished);

    const resp = await axios.request({
        url: 'http://127.0.0.1:8005/upload',
        responseType: 'stream',
        method: 'post',
        params: {},
        data: input.pipe(b64Transformer).pipe(wrapTransformer),
        headers: {
            // Total body size: size(wrapper) + size(base64 data)
            'Content-Length': (Math.floor((stat.size + 5) / 3) - 1) * 4 + 25
        }
    });
    resp.data.pipe(process.stdout);
    await finished(process.stdout);
}

main();
