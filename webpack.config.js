/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
// const Dotenv = require('dotenv-webpack');
const webpack = require("webpack");
const dotenv = require("dotenv");
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );

const baseUrl = '/';

const cssLoader = {
  loader: 'css-loader',
  options: {
    modules: false,
    // https://github.com/webpack-contrib/css-loader#importloaders
    importLoaders: 2
  }
};

const sassLoader = {
  loader: 'sass-loader',
  options: {
    sassOptions: {
      includePaths: ['node_modules']
    }
  }
};

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: ['autoprefixer']
    }
  }
};

const ensureArray = ( config ) => config && ( Array.isArray( config ) ? config : [ config ] ) || []
const when = ( condition, config, negativeConfig ) =>
  condition ? ensureArray( config ) : ensureArray( negativeConfig )

module.exports = function ( env, { analyze, tests } ) {
  const production = env.production || process.env.NODE_ENV === 'production';
  return {
    target: 'web',
    mode: production ? 'production' : 'development',
    devtool: production ? undefined : 'eval-cheap-source-map', // TODO make sourcemaps work
    entry: {
      entry: './src/main.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: production ? '[name].[contenthash].bundle.js' : '[name].bundle.js'
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'dev-app'), 'node_modules'],
      alias: production ? {
        // add your production aliasing here
      } : {
        ...[
          'fetch-client',
          'kernel',
          'metadata',
          'platform',
          'platform-browser',
          'plugin-conventions',
          'route-recognizer',
          'router',
          'router-lite',
          'runtime',
          'runtime-html',
          'testing',
          'webpack-loader',
        ].reduce((map, pkg) => {
          const name = `@aurelia/${pkg}`;
          map[name] = path.resolve(__dirname, 'node_modules', name, 'dist/esm/index.dev.mjs');
          return map;
        }, {
          'aurelia': path.resolve(__dirname, 'node_modules/aurelia/dist/esm/index.dev.mjs'),
          // add your development aliasing here
        })
      },
      fallback: { // this is needed for packages that use native nodejs modules like 'fs', 'os', etc.
        "fs": false,
        "tls": false,
        "os": false,
        "assert": false,
        "url": false,
        "net": false,
        "path": false,
        "zlib": false,
        "http": false,
        "https": false,
        "stream": false,
        "crypto": false,
        "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify
      }
    },
    devServer: {
      historyApiFallback: true,
      open: !process.env.CI,
      static: {
        directory: path.join( __dirname, '/static' ),
      },
      compress: true,
      port: 9000
    },
    module: {
      rules: [
        { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: 'asset' },
        { test: /\.(woff|woff2|ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i,  type: 'asset' },
        { test: /\.css$/i, use: [ 'style-loader', cssLoader, postcssLoader ] },
        { test: /\.scss$/i, use: [ 'style-loader', cssLoader, postcssLoader, sassLoader ] },
        { test: /\.ts$/i, use: ['ts-loader', '@aurelia/webpack-loader'], exclude: /node_modules/ },
        {
          test: /[/\\]src[/\\].+\.html$/i,
          use: '@aurelia/webpack-loader',
          exclude: /node_modules/
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'index.html',
        metadata: {
          // available in index.html //
          baseUrl
        }
      }),
      // new Dotenv({
      //   // path: `./.env${production ? '' :  '.' + (process.env.NODE_ENV || 'development')}`,
      //   path: `./.env`,
      // }),
      new webpack.DefinePlugin({ // the above Dotenv plugin doesn't work
        'process.env': JSON.stringify(dotenv.config().parsed)
      }),
      analyze && new BundleAnalyzerPlugin(),
      // Work around for Buffer is undefined:
      // https://github.com/webpack/changelog-v5/issues/10
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      // new webpack.ProvidePlugin({ // we might need this in the future
      //   process: 'process/browser',
      // }),
      ...when( !tests, new CopyWebpackPlugin( {
        patterns: [
          { from: 'static', to: './', globOptions: { ignore: [ '.*' ] } }
        ]
      } ) )
    ].filter(p => p)
  }
}
