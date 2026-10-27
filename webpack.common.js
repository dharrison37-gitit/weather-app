import path from "node:path";
import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
  entry: {
    app: "./src/index.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(import.meta.dirname, "dist"),
    clean: true,
    html: {
      title: "Production",
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.svg$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "assets/icons/",
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.html$/i,
        use: ["html-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        use: "asset/resource",
      },
    ],
  },
};
