/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors (https://github.com/finos/perspective)
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

 const execSync = require("child_process").execSync;
 const path = require("path");
 
 const execute_throw = (cmd) => {
    if (process.argv.indexOf("--debug") > -1) {
        console.log(`$ ${cmd}`);
    }
    execSync(cmd, {stdio: "inherit"});
};

 try {
     const cwd = process.cwd();
     const cmd = process.argv.slice(2).join(" ");
     const emsdkdir = path.join(__dirname, "..", ".emsdk");
     execute_throw(`cd ${emsdkdir} && . ./emsdk_env.sh && cd ${cwd} && ${cmd}`);
 } catch (e) {
     console.log(e.message);
     process.exit(1);
 }