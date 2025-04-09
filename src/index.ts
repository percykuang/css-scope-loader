import type { LoaderContext } from 'webpack';
import processJS from './processJS';
import processCSS from './processCSS';

interface CSSScopeLoaderOptions {
  scope?: string;
}

function cssScopeLoader(this: LoaderContext<CSSScopeLoaderOptions>, source: string): string {
  this.cacheable && this.cacheable();

  const options = this.getOptions();
  const scope = options.scope || 'your-scope';
  const resourcePath = this.resourcePath.toLowerCase();

  try {
    if (/\.(jsx?|tsx?)$/.test(resourcePath)) {
      return processJS(source, scope);
    } else if (/\.css$/.test(resourcePath)) {
      return processCSS(source, scope);
    }
    return source;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    this.emitError(new Error(`类名前缀处理错误: ${errorMessage}`));
    return source;
  }
}

// 声明 loader 的 raw 属性
cssScopeLoader.raw = false;

export default cssScopeLoader;
