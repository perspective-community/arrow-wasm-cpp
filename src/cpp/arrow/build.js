/******************************************************************************
 *
 * Copyright (c) 2021, the exprtk.js Authors.
 *
 * This file is part of the exprtk.js library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const {execSync} = require("child_process");
const os = require("os");
const path = require("path");

const stdio = "inherit";
const env = process.DEBUG ? "debug" : "release";
const cwd = path.join(process.cwd(), "dist", env);

delete process.env.NODE;

try {
    execSync(`mkdirp ${cwd}`, {stdio});
    process.env.CLICOLOR_FORCE = 1;
    execSync(`emcmake cmake ${__dirname} -DCMAKE_BUILD_TYPE=${env}`, {
        cwd,
        stdio,
    });
    execSync(`emmake make -j${os.cpus().length/2}`, {
        cwd,
        stdio,
    });
    execSync(`cpx esm/**/* ../esm`, {cwd, stdio});
    execSync(`cpx cjs/**/* ../cjs`, {cwd, stdio});
} catch (e) {
    console.error(e);
    process.exit(1);
}