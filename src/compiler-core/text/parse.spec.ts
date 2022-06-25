import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
import { describe, test, expect } from 'vitest'
describe("Parse", () => {
  describe("interpolation", () => {
    test("simple interpolation", () => {
      const ast = baseParse("{{ message }}");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      });
    });
  });
});


describe("Parse", () => {
  describe("element", () => {
    test("tag element", () => {
      const ast = baseParse("<div></div>");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
        children: [],
      });
    });
  });
});

describe("Parse", () => {
  describe("text", () => {
    test("simple text", () => {
      const ast = baseParse("simple text");

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "simple text",
      });
    });
  });
});


test('hello word', () => {
  const ast = baseParse('<span>hi,{{message}}</span>');
  expect(ast.children[0]).toStrictEqual({
    type: NodeTypes.ELEMENT,
    tag: 'span',
    children: [
      {
        type: NodeTypes.TEXT,
        content: "hi,",
      },
      {
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      }
    ]
  });
})


test('nested to', () => {
  const ast = baseParse('<div><p>hi,</p>{{message}}</div>');
  expect(ast.children[0]).toStrictEqual({
    type: NodeTypes.ELEMENT,
    tag: 'div',
    children: [
      {
        type: NodeTypes.ELEMENT,
        tag: 'p',
        children: [
          {
            type: NodeTypes.TEXT,
            content: "hi,",
          },
        ]
      },
      {
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      }
    ]
  });
})


test('should throw error when lack end tag', () => {
  expect(() => {
    baseParse('<div><span></div>');
  }).toThrowError('缺少结束标签:span');
})