// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/* eslint-disable */
const { ProvidePlugin } = require("webpack");
const  path  = require("path");
const webpack = require("@cypress/webpack-preprocessor");
const webpackFunc = require("../../webpack.config")
const options = webpackFunc({development:true});
console.log('TCL ~ file: index.js ~ line 19 ~ options', options)

module.exports = (on, config) => {
  // bind to the event we care about
  // on('<event>', (arg1, arg2) => {
  //   // plugin stuff here
  // });
  on("file:preprocessor", webpack({
    webpackOptions: {
      ...options,
      resolve: {
        extensions: [".ts", ".js"],
        alias: {
          process: 'process/browser',
          buffer: 'buffer',
          services: path.resolve(__dirname, '../../src/services'),
          resources: path.resolve(__dirname, '../../src/resources'),
        },
        fallback: {
          crypto: require.resolve( 'crypto-browserify' ),
          stream: require.resolve( 'stream-browserify' ),
          os: require.resolve( 'os-browserify/browser' ),
          http: require.resolve( 'stream-http' ),
          https: require.resolve( 'https-browserify' ),
          buffer: require.resolve( 'buffer/' ),
        }
      },
      devtool: 'cheap-module-source-map',
      devServer: {
        client: {
          overlay: false,
        },
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: [/node_modules/],
            use: [
              {
                loader: "ts-loader"
              }
            ]
          },
          {
            test: /\.feature$/,
            use: [
              {
                loader: "@badeball/cypress-cucumber-preprocessor/webpack",
                options: config
              }
            ]
          }
        ]
      },
      plugins: [
        new ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
      output: undefined
    }
  }));
};
