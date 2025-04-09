import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

/**
 * 处理 className 字符串
 */
export function prefixClassNames(classNames: string, prefix: string): string {
  return classNames
    .split(/\s+/)
    .map((className) => (className ? `${prefix}${className}` : className))
    .join(' ');
}

/**
 * 处理 JSX/TSX 中的 className 属性，保持原始代码格式不变
 */
function processJS(content: string, prefix: string): string {
  const ast = babelParse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    allowReturnOutsideFunction: true,
    createParenthesizedExpressions: true,
  });

  // 处理字符串字面量中的类名
  const processStringLiteral = (node: t.StringLiteral) => {
    node.value = prefixClassNames(node.value, prefix);
  };

  // 处理条件表达式中的类名
  const processConditionalExpression = (node: t.ConditionalExpression) => {
    if (t.isStringLiteral(node.consequent)) {
      processStringLiteral(node.consequent);
    }
    if (t.isStringLiteral(node.alternate)) {
      processStringLiteral(node.alternate);
    }
  };

  traverse(ast, {
    JSXAttribute(path) {
      // 只处理 className 属性
      if (path.node.name.name !== 'className') {
        return;
      }

      const value = path.node.value;
      if (!value) return;

      // 处理字符串字面量
      if (t.isStringLiteral(value)) {
        processStringLiteral(value);
        return;
      }

      // 处理表达式容器
      if (t.isJSXExpressionContainer(value)) {
        const expression = value.expression;

        // 处理三元表达式
        if (t.isConditionalExpression(expression)) {
          processConditionalExpression(expression);
          return;
        }

        // 处理模板字符串
        if (t.isTemplateLiteral(expression)) {
          // 处理模板字符串中的静态部分
          expression.quasis.forEach((quasi) => {
            if (quasi.value.raw.trim()) {
              quasi.value.raw = prefixClassNames(quasi.value.raw, prefix);
              quasi.value.cooked = prefixClassNames(quasi.value.cooked || '', prefix);
            }
          });

          // 处理模板字符串中的表达式
          expression.expressions.forEach((expr) => {
            if (t.isConditionalExpression(expr)) {
              processConditionalExpression(expr);
            } else if (t.isLogicalExpression(expr)) {
              if (t.isStringLiteral(expr.right)) {
                processStringLiteral(expr.right);
              }
            } else if (t.isStringLiteral(expr)) {
              processStringLiteral(expr);
            }
          });
          return;
        }

        // 处理逻辑表达式 (&&)
        if (t.isLogicalExpression(expression)) {
          if (t.isStringLiteral(expression.right)) {
            processStringLiteral(expression.right);
          }
          return;
        }
      }
    },
  });

  return generate(ast).code;
}

export default processJS;
