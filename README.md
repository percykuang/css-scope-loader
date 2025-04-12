## 功能

一个 Webpack Loader，用于 React 项目中，给类名加上作用域（前缀），实现样式隔离。

## 用法

安装：

```bash
npm i -D css-scope-loader
或
yarn add -D css-scope-loader
```

修改 webpack 配置文件：

以`craco.config.js`文件为例：

```js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.(js|jsx|ts|tsx|css)$/,
        use: [
          {
            loader: 'css-scope-loader',
            options: {
              scope: 'my-scope', // 你可以自定义这个值
            },
          },
        ],
      });
      return webpackConfig;
    },
  },
};
```
