/* ***************************************************************************
 *
 * Copyright (c) 2021, the arrow-wasm-cpp authors.
 *
 * This file is part of the arrow-wasm-cpp library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          chrome: "70",
          ios: "13",
        },
        modules: process.env.BABEL_MODULE || "auto",
        useBuiltIns: "usage",
        corejs: 3,
      },
    ],
  ],
  sourceType: "unambiguous",
  plugins: [["@babel/plugin-proposal-decorators", {legacy: true}], "transform-custom-element-classes", "@babel/plugin-proposal-class-properties", "@babel/plugin-proposal-optional-chaining"],
  sourceMaps: true,
};
