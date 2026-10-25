import path from "node:path";

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
};
