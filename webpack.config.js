const path = require("path")
const nodeExternals = require("webpack-node-externals")

module.exports = {
  entry: "./main.ts",
  output:{
    path: path.resolve(__dirname),
    filename: "main.js",
    libraryTarget: "commonjs"
  },
  resolve:{
    extensions:[".ts",".js"]
  },
  module:{
    rules:[
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  externals: [nodeExternals()],
  target: "node",
  mode: "production"
}
