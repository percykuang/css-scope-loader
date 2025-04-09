import processCSS from '../src/processCSS';

/**
 * 规范化 CSS 字符串
 * 移除不必要的空白字符并标准化格式
 */
const normalizeCss = (css: string): string => {
  return css
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/}\s*/g, '}\n')
    .replace(/\n+/g, '\n')
    .trim();
};

describe('类名前缀加载器测试', () => {
  describe('基础功能测试', () => {
    test('应该为简单的类选择器添加前缀', () => {
      const source = `.button { color: red; }`;
      const expected = `.test-button{color:red;}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理同一规则中的多个类选择器', () => {
      const source = `.btn.primary { color: blue; }`;
      const expected = `.test-btn.test-primary{color:blue;}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该保留非类选择器', () => {
      const source = `div.container #id { margin: 0; }`;
      const expected = `div.test-container #id{margin:0;}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });
  });

  describe('复杂选择器测试', () => {
    test('应该处理深层嵌套的选择器', () => {
      const source = `.header .nav .item.active { color: blue; }`;
      const expected = `.test-header .test-nav .test-item.test-active{color:blue;}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理逗号分隔的选择器', () => {
      const source = `.header, .footer { margin: 0; }`;
      const expected = `.test-header,.test-footer{margin:0;}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理伪类和伪元素', () => {
      const source = `.button:hover::before { content: ""; }`;
      const expected = `.test-button:hover::before{content:"";}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理属性选择器', () => {
      const source = `.input[type="text"].large { width: 100%; }`;
      const expected = `.test-input[type="text"].test-large{width:100%;}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理子选择器和相邻选择器', () => {
      const source = `.parent > .child + .sibling { margin: 10px; }`;
      const expected = `.test-parent > .test-child + .test-sibling{margin:10px;}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });
  });

  describe('边界情况测试', () => {
    test('应该处理空格和换行', () => {
      const source = `
        .button    {
          color:    red;
        }
      `;
      const expected = `.test-button{color:red;}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理空规则', () => {
      const source = `.empty{}`;
      const expected = `.test-empty{}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理连续的多个类名', () => {
      const source = `.one.two.three { color: red; }`;
      const expected = `.test-one.test-two.test-three{color:red;}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理空内容', () => {
      const source = ``;
      const expected = ``;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理只有空格和换行的内容', () => {
      const source = `
      
      `;
      const expected = ``;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });
  });

  describe('特殊规则测试', () => {
    test('应该处理媒体查询', () => {
      const source = `@media screen and (max-width: 768px) {
        .mobile-menu { display: block; }
        .desktop-menu { display: none; }
      }`;
      const expected = `@media screen and (max-width: 768px){.test-mobile-menu{display:block;}.test-desktop-menu{display:none;}}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理关键帧动画', () => {
      const source = `@keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .opacity {
        animation: fadeIn 1s ease-in;
      }`;
      const expected = `@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}.test-opacity{animation:fadeIn 1s ease-in;}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理支持查询', () => {
      const source = `@supports (display: grid) {
        .grid-layout { display: grid; }
      }`;
      const expected = `@supports (display: grid){.test-grid-layout{display:grid;}}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理CSS变量', () => {
      const source = `.theme-dark {
        --bg-color: #000;
      }
      .button {
        background-color: var(--bg-color);
      }`;
      const expected = `.test-theme-dark{--bg-color:#000;}.test-button{background-color:var(--bg-color);}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });
  });

  describe('复杂组合测试', () => {
    test('应该处理复杂的选择器组合', () => {
      const source = `
        .header > .nav:not(.hidden) + .content.main {
          color: blue;
        }
        @media (prefers-color-scheme: dark) {
          .theme.dark .button:hover {
            background: #333;
          }
        }
      `;
      const expected = `.test-header > .test-nav:not(.test-hidden) + .test-content.test-main{color:blue;}@media (prefers-color-scheme: dark){.test-theme.test-dark .test-button:hover{background:#333;}}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });

    test('应该处理嵌套的媒体查询和支持查询', () => {
      const source = `
        @media screen and (min-width: 768px) {
          @supports (display: grid) {
            .grid-container {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            }
          }
        }
      `;
      const expected = `@media screen and (min-width: 768px){@supports (display: grid){.test-grid-container{display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));}}}`;

      const result = processCSS(source, 'test-');
      expect(normalizeCss(result)).toBe(normalizeCss(expected));
    });
  });
});
