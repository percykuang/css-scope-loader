// 定义 CSS AST 类型
export interface CssRule {
  type: string;
  selectors?: string[];
  declarations?: Array<{
    type: string;
    property?: string;
    value?: string;
  }>;
  rules?: CssRule[]; // 用于 @media 和 @supports
  keyframes?: CssRule[]; // 用于 @keyframes
  media?: string; // 媒体查询条件
  supports?: string; // 支持查询条件
  name?: string; // @keyframes 名称
}

export interface CssAst {
  type: string;
  stylesheet: {
    rules: CssRule[];
  };
}
