import { describe, expect, it, test } from 'vitest';
import { generate } from '../src/codegen';
import { baseParse } from '../src/parse';
import { transform } from '../src/tranform';

describe('codegen', () => {
  test('string', () => {
    const ast = baseParse('hi');
    transform(ast);
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  })
})