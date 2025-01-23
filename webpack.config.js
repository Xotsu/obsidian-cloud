const path = require("path")

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
  externals:{
    obsidian: "commonjs obsidian"
  },
  target: "node",
  mode: "production"
}
