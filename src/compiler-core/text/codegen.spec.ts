import { describe, expect, it, test } from 'vitest';
import { generate } from '../src/codegen';
import { baseParse } from '../src/parse';
import { transform } from '../src/tranform';
import { transformExpression } from '../src/transform/transformExpression';

describe('codegen', () => {
  it('string', () => {
    const ast = baseParse('hi');
    transform(ast);
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  })
})

describe('codegen', () => {
  it('interpolation', () => {
    const ast = baseParse('{{message}}');
    transform(ast, {
      nodeTransforms: [transformExpression]
    });
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  })
})