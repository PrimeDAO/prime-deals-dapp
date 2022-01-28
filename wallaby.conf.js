const path = require("path");
let wallabyWebpack = require("wallaby-webpack");
let AureliaPlugin = require("aurelia-webpack-plugin").AureliaPlugin;
let DefinePlugin = require("webpack").DefinePlugin;
let webpack = require("webpack");

module.exports = function(wallaby) {
  let wallabyPostprocessor = wallabyWebpack({
    resolve: {
      modules: [
        path.join(wallaby.projectCacheDir, "src"),
        path.join(__dirname, "node_modules"),
        path.join(__dirname, "../../node_modules")
      ]
    },
    "node": {
      "fs": "empty"
    },

    module: {
      rules: [{
        test: /\.html$/i,
        loader: "html-loader"
      },
      {
        test: /\.png$|\.gif$|\.svg$|\.jpe?g$/,
        loaders: "null"
      },
      {
        test: /\.css$/i,
        issuer: [{
          not: [{
            test: /\.html$/i
          }]
        }],
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.css$/i,
        issuer: [{
          test: /\.html$/i
        }],
        use: "css-loader"
      }
      ]
    },

    plugins: [
      new DefinePlugin({
        AURELIA_WEBPACK_2_0: undefined
      }),
      new AureliaPlugin({
        aureliaApp: undefined,
        viewsFor: "{" + path.relative(path.resolve(), wallaby.projectCacheDir) + "/,}**/!(tslib)*.{ts,js}"
      }),
      new webpack.NormalModuleReplacementPlugin(/\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico||scss|css)$/, "node-noop"),
      new webpack.ProvidePlugin({})
    ]
  });

  return {
    files: [
      {
        pattern: "src/**/*.+(ts|html|json)",
        load: false
      },
    ],


    tests: [
      "test/unit/entities/Deal.spec.ts"
      // { pattern: "test/unit/**/*.spec.ts", load: false },
      // { pattern: "test/unit/**/abstract-mode.spec.ts", load: false }
      // { pattern: "test/unit/**/Deal.spec.ts", load: false }
      // { pattern: "test/unit/**/vim.spec.ts", load: false }
    ],

    compilers: {
      "**/*.ts": wallaby.compilers.typeScript({
        module: "commonjs"
      })
    },

    env: {
      kind: "chrome"
    },

    postprocessor: wallabyPostprocessor,

    setup: function() {
      window.__moduleBundler.loadTests();
    },

    debug: true
  };
};