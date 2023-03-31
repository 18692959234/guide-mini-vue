import { describe, expect, it, test } from 'vitest';
import { NodeTypes } from '../src/ast';
import { baseParse } from '../src/parse';
import { transform } from '../src/tranform';

describe('transform', () => {
  it('happy path', () => {
    const ast = baseParse('<div>hi,{{message}}</div>');
    const plugin = (node) => {
      if (node.type === NodeTypes.TEXT) {
        node.content = node.content + 'hi'
      }
    }
    transform(ast, {
      nodeTransforms: [plugin],
    })
    const node = ast.children[0].children[0];
    expect(node.content).toBe('hi,hi')
  })

})