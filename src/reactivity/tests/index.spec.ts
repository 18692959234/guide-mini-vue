import { test, expect } from 'vitest';
import { add } from '../index'

test('should', () => {
  expect(add(1,3)).toBe(4)
})