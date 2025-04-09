import processJS from '../src/processJS';

/**
 * 规范化代码字符串
 * 移除不必要的空白字符
 */
const normalizeCode = (code: string): string => {
  return (
    code
      // 先处理括号和关键字周围的空格
      .replace(/\breturn\s*\(/g, 'return (') // return 后面的括号
      .replace(/\s*\(\s*/g, ' (') // 左括号
      .replace(/\s*\)\s*/g, ') ') // 右括号
      // 然后处理其他空白字符
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, '') // 移除所有分号
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*:\s*/g, ':')
      .trim()
  );
};

describe('JavaScript/TypeScript类名前缀处理器测试', () => {
  describe('JSX/TSX className测试', () => {
    test('应该处理静态className属性', () => {
      const source = `
        <div className="container">
          <button className="btn primary">
            <span className="icon"></span>
          </button>
        </div>
      `;
      const expected = `
        <div className="test-container">
          <button className="test-btn test-primary">
            <span className="test-icon"></span>
          </button>
        </div>
      `;

      const result = processJS(source, 'test-');
      expect(normalizeCode(result)).toBe(normalizeCode(expected));
    });

    test('应该处理动态className属性', () => {
      const source = `
        <div className={isActive ? 'active' : 'inactive'}>
          <span className={\`icon \${size}\`}></span>
        </div>
      `;
      const expected = `
        <div className={isActive ? \"test-active\" : \"test-inactive\"}>
          <span className={\`test-icon \${size}\`}></span>
        </div>
      `;

      const result = processJS(source, 'test-');
      expect(normalizeCode(result)).toBe(normalizeCode(expected));
    });

    test('应该处理复杂的条件className', () => {
      const source = `
        <button
          className={\`
            btn
            \${isLarge ? 'btn-large' : 'btn-small'}
            \${isDisabled && 'disabled'}
          \`}
        >
          Click me
        </button>
      `;
      const expected = `
        <button
          className={\`
            test-btn
            \${isLarge ? \"test-btn-large\" : \"test-btn-small\"}
            \${isDisabled && \"test-disabled\"}
          \`}
        >
          Click me
        </button>
      `;

      const result = processJS(source, 'test-');
      expect(normalizeCode(result)).toBe(normalizeCode(expected));
    });

    test('应该处理多层嵌套的JSX结构', () => {
      const source = `
        function Component() {
          return (
            <div className="wrapper">
              <nav className="nav">
                {items.map(item => (
                  <div className={\`item \${item.active ? 'active' : ''}\`}>
                    {item.content}
                  </div>
                ))}
              </nav>
            </div>
          );
        }
      `;
      const expected = `
        function Component() {
          return (
            <div className="test-wrapper">
              <nav className="test-nav">
                {items.map(item => (
                  <div className={\`test-item \${item.active ? \"test-active\" : ''}\`}>
                    {item.content}
                  </div>
                ))}
              </nav>
            </div>
          );
        }
      `;

      const result = processJS(source, 'test-');
      expect(normalizeCode(result)).toBe(normalizeCode(expected));
    });
  });

  describe('边界情况测试', () => {
    test('应该保留非className的JSX属性', () => {
      const source = `
        <div
          id="main"
          data-value="some-value"
          style={{ color: 'red' }}
          onClick={() => console.log('clicked')}
          className="container"
        />
      `;
      const expected = `
        <div
          id="main"
          data-value="some-value"
          style={{ color: 'red' }}
          onClick={() => console.log('clicked')}
          className="test-container"
        />
      `;

      const result = processJS(source, 'test-');
      expect(normalizeCode(result)).toBe(normalizeCode(expected));
    });

    test('应该保留字符串变量和其他字面量', () => {
      const source = `
        const apiUrl = "/api/endpoint";
        const buttonText = "Click me";
        const styles = { color: 'red' };
        
        return (
          <button className="btn primary" style={styles}>
            {buttonText}
          </button>
        );
      `;
      const expected = `
        const apiUrl = "/api/endpoint";
        const buttonText = "Click me";
        const styles = { color: 'red' };
        
        return (
          <button className="test-btn test-primary" style={styles}>
            {buttonText}
          </button>
        );
      `;

      const result = processJS(source, 'test-');
      expect(normalizeCode(result)).toBe(normalizeCode(expected));
    });

    test('应该保留注释', () => {
      const source = `
        {/* 这是一个按钮 */}
        <button
          // 使用primary类名
          className="btn primary"
          /* 内联样式 */
          style={{ color: 'blue' }}
        >
          Click me
        </button>
      `;
      const expected = `
        {/* 这是一个按钮 */}
        <button
          // 使用primary类名
          className="test-btn test-primary"
          /* 内联样式 */
          style={{ color: 'blue' }}
        >
          Click me
        </button>
      `;

      const result = processJS(source, 'test-');
      expect(normalizeCode(result)).toBe(normalizeCode(expected));
    });
  });
});
