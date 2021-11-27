/*******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors (https://github.com/finos/perspective)
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

 require("dotenv").config({path: "./.perspectiverc"});

 const {emscripten} = require("../package.json");
 const execSync = require("child_process").execSync;
 const path = require("path");
 const os = require("os");
 const fs = require("fs");
 
 const execute_throw = (cmd) => {
    if (process.argv.indexOf("--debug") > -1) {
        console.log(`$ ${cmd}`);
    }
    execSync(cmd, {stdio: "inherit"});
};

 function base() {
     return path.join(__dirname, "..", ".emsdk").toString();
 }
 
 function emsdk_checkout() {
    execute_throw(`git clone https://github.com/emscripten-core/emsdk.git ${base()}`);
 }
 
 function emsdk(...args) {
     const basedir = base();
     const suffix = os.type() == "Windows_NT" ? ".bat" : "";
     const emsdk = path.join(basedir, "emsdk" + suffix);
     execute_throw(`${emsdk} ${args.join(" ")}`);
 }
 
 function upgrade() {
     console.log(`-- Emscripten not found, installing ${emscripten}`);
     emsdk_checkout();
     emsdk("install", emscripten);
     emsdk("activate", emscripten);
     console.log(`-- Emscripten ${emscripten} installed`);
 }
 
 function check() {
     try {
         execute_throw`emcc --version`;
         return true;
     } catch (e) {
         return fs.existsSync(path.join(__dirname, "..", ".emsdk"));
     }
 }
 
 if (!check()) {
     upgrade();
 }
