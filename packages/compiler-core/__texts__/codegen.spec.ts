import { describe, expect, it, test } from 'vitest';
import { generate } from '../src/codegen';
import { baseParse } from '../src/parse';
import { transform } from '../src/tranform';
import { transformElement } from '../src/transform/transformElement';
import { transformExpression } from '../src/transform/transformExpression';
import { transformText } from '../src/transform/transformText';

describe('codegen string', () => {
  it('string', () => {
    const ast = baseParse('hi');
    transform(ast);
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  })
})

describe('codegen interpolation', () => {
  it('interpolation', () => {
    const ast = baseParse('{{message}}');
    transform(ast, {
      nodeTransforms: [transformExpression]
    });
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  })
})

describe('codegen element', () => {
  it('element', () => {
    const ast = baseParse('<div>hi,{{message}}</div>');
    transform(ast, {
      nodeTransforms: [transformExpression, transformElement, transformText, ]
    });
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  })
})
