import { parse as cssParser, stringify as cssStringify } from 'css';
import type { CssAst, CssRule } from './types';

/**
 * 处理 CSS 规则
 * @param rules CSS 规则数组
 * @param scope 作用域
 */
function processRules(rules: CssRule[], scope: string): void {
  rules.forEach((rule: CssRule) => {
    switch (rule.type) {
      case 'rule':
        // 处理普通规则
        if (rule.selectors) {
          rule.selectors = rule.selectors.map((selector: string) => {
            return selector.replace(/\.([\w-]+)/g, `.${scope}$1`);
          });
        }
        break;

      case 'media':
      case 'supports':
      case 'document':
      case 'host':
      case 'layer':
        // 处理所有可能包含嵌套规则的 at-rules
        if (rule.rules) {
          processRules(rule.rules, scope);
        }
        break;

      case 'keyframes':
        // 处理关键帧动画
        if (rule.keyframes) {
          processRules(rule.keyframes, scope);
        } else if (rule.rules) {
          // 某些 CSS 解析器可能将关键帧放在 rules 中
          processRules(rule.rules, scope);
        }
        break;

      default:
        // 处理其他可能包含规则的节点
        if (rule.rules && Array.isArray(rule.rules)) {
          processRules(rule.rules, scope);
        }
        if (rule.keyframes && Array.isArray(rule.keyframes)) {
          processRules(rule.keyframes, scope);
        }
        break;
    }
  });
}

/**
 * 处理 CSS 内容
 * @param content CSS 内容
 * @param scope 作用域
 * @returns 处理后的 CSS 内容
 */
function processCSS(content: string, scope: string): string {
  try {
    // 确保输入内容不为空
    if (!content.trim()) {
      return '';
    }

    // 如果是简单的空规则，直接处理
    if (content.match(/^\.([\w-]+)\s*{\s*}\s*$/)) {
      return content.replace(/\.([\w-]+)/g, `.${scope}$1`);
    }

    const ast = cssParser(content, {
      silent: false, // 不静默处理错误
    }) as CssAst;

    // 确保 AST 和规则数组存在
    if (!ast || !ast.stylesheet || !Array.isArray(ast.stylesheet.rules)) {
      // 如果 AST 解析失败，尝试直接处理选择器
      return content.replace(/\.([\w-]+)/g, `.${scope}$1`);
    }

    // 递归处理所有规则
    processRules(ast.stylesheet.rules, scope);

    // 将 AST 转换回 CSS 代码
    const result = cssStringify(ast);

    // 如果转换结果为空，尝试直接处理原始内容
    if (!result) {
      return content.replace(/\.([\w-]+)/g, `.${scope}$1`);
    }

    return result;
  } catch (error) {
    // 发生错误时，尝试直接处理原始内容
    console.error('处理 CSS 内容时出错:', error);
    return content.replace(/\.([\w-]+)/g, `.${scope}$1`);
  }
}

export default processCSS;
