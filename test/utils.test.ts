import { expect, test } from 'vitest'
import { compileTSStringExpression } from '../src/index.js'

function success(...values: string[]) {
  return { success: true, value: values }
}

test('LiteralExpression', () => {
  expect(compileTSStringExpression(
    '`123`', { deep: false }
  )).toEqual(success("123"))
  expect(compileTSStringExpression(
    `'123'`, { deep: false }
  )).toEqual(success("123"))
  expect(compileTSStringExpression(
    `"123"`, { deep: false }
  )).toEqual(success("123"))
  expect(compileTSStringExpression(
    `("123")`, { deep: false }
  )).toEqual(success("123"))
})

test('ConditionalExpression', () => {
  expect(compileTSStringExpression(
    '`${true ? "A" : "B"}2${true ? "C" : "D"}3`', { deep: true }
  )).toEqual(success("A2C3", "A2D3", "B2C3", "B2D3"))
  expect(compileTSStringExpression(
    '`${true ? "A" : "B"}2${true ? "C" : "D"}3`', { deep: false }
  )).toEqual(success("{}2{}3"))
  expect(compileTSStringExpression(
    '`${identifier}23`', { deep: false }
  )).toEqual(success("{}23"))
})

test('BinaryExpression', () => {
  expect(compileTSStringExpression(
    '`1` + "23"', { deep: true }
  )).toEqual(success("123"))

  expect(compileTSStringExpression(
    '`1` + identifier', { deep: true }
  )).toEqual(success("1{}"))

  expect(compileTSStringExpression(
    '`1` + identifier', { deep: false }
  )).toEqual(success("1{}"))
})

test('CallExpression', () => {
  expect(compileTSStringExpression(
    '`1` + getId()', { deep: false }
  )).toEqual(success("1{}"))
  expect(compileTSStringExpression(
    '`1${getId()}`', { deep: true }
  )).toEqual(success("1{}"))
})

test('SequenceExpression', () => {
  expect(compileTSStringExpression(
    '`1`,"5"', { deep: false }
  )).toEqual(success("5"))
  expect(compileTSStringExpression(
    '`1`,identifier,"this"', { deep: false }
  )).toEqual(success("this"))
})

test('LogicalExpression', () => {
  expect(compileTSStringExpression(
    '`1` && "5"', { deep: false }
  )).toEqual(success("{}"))
  expect(compileTSStringExpression(
    '`1` && "5"', { deep: true }
  )).toEqual(success("1", "5"))
})

test('AssignmentExpression', () => {
  expect(compileTSStringExpression(
    '`1` + (id=0)', { deep: false }
  )).toEqual(success("10"))
  expect(compileTSStringExpression(
    '`1` + (id=0)', { deep: true }
  )).toEqual(success("10"))
  expect(compileTSStringExpression(
    '`1` + (id+=0)', { deep: true }
  )).toEqual(success("1{}"))
  expect(compileTSStringExpression(
    '`1` + (id??=0)', { deep: true }
  )).toEqual(success("1{}"))
})

test('UnaryExpression', () => {
  expect(compileTSStringExpression(
    '`1` + (!id)', { deep: false }
  )).toEqual(success("1{}"))
  expect(compileTSStringExpression(
    '`1` + (!0)', { deep: true }
  )).toEqual(success("1{}"))
  expect(compileTSStringExpression(
    '`1` + typeof id', { deep: true }
  )).toEqual(success("1{}"))
})

test('Random', () => {
  expect(compileTSStringExpression(
    '`/get/${obj.path?.id}/?s=` + true + `&h=${getH()}&c=${i?o?1:2:3}`', { deep: false }
  )).toEqual(success("/get/{}/?s=true&h={}&c={}"))
  expect(compileTSStringExpression(
    '`/get/${obj.path?.id}/?s=` + (true + `&h=${getH()}&c=${i?o?1:2:3}`)', { deep: true }
  )).toEqual(success(
    "/get/{}/?s=true&h={}&c=1",
    "/get/{}/?s=true&h={}&c=2",
    "/get/{}/?s=true&h={}&c=3"
  ))
  expect(compileTSStringExpression(
    '`/get${i ? "User" : "Company"}/`', { deep: false }
  )).toEqual(success(
    "/get{}/"
  ))
  expect(compileTSStringExpression(
    '`/api/${i ? o ? o : "User" : "Company"}/`', { deep: true }
  )).toEqual(success(
    "/api/{}/",
    "/api/User/",
    "/api/Company/"
  ))
  expect(compileTSStringExpression(
    "'date: ' + new Date()", { deep: true }
  )).toEqual(success("date: {}"))
  expect(compileTSStringExpression(
    "'string: ' + new String('hello')", { deep: true }
  )).toEqual(success("string: {}"))
  expect(compileTSStringExpression(
    "'obj: ' + {}", { deep: true }
  )).toEqual(success("obj: {}"))
})

test('NewExpression', () => {
  expect(compileTSStringExpression(
    "'date: ' + new Date()", { deep: true }
  )).toEqual(success("date: {}"))
  expect(compileTSStringExpression(
    "'string: ' + new String('hello')", { deep: true }
  )).toEqual(success("string: {}"))
  expect(compileTSStringExpression(
    "'obj: ' + {}", { deep: true }
  )).toEqual(success("obj: {}"))
})

test('ParenthesizedExpression', () => {
  expect(compileTSStringExpression(
    "('hello') + ' world'", { deep: true }
  )).toEqual(success("hello world"))
  expect(compileTSStringExpression(
    "(`template ${expr}`)", { deep: false }
  )).toEqual(success("template {}"))
  expect(compileTSStringExpression(
    "('prefix') + (identifier) + ('suffix')", { deep: false }
  )).toEqual(success("prefix{}suffix"))
})

test('AssignmentExpression', () => {
  expect(compileTSStringExpression(
    "(str = 'hello') + ' world'", { deep: true }
  )).toEqual(success("hello world"))
  expect(compileTSStringExpression(
    "(str += ' more')", { deep: false }
  )).toEqual(success("{}"))
  expect(compileTSStringExpression(
    "'prefix: ' + (value = getValue())", { deep: false }
  )).toEqual(success("prefix: {}"))
})

test('UpdateExpression', () => {
  expect(compileTSStringExpression(
    "'count: ' + (++counter)", { deep: false }
  )).toEqual(success("count: {}"))
  expect(compileTSStringExpression(
    "'count: ' + (counter++)", { deep: false }
  )).toEqual(success("count: {}"))
  expect(compileTSStringExpression(
    "`value: ${--index}`", { deep: false }
  )).toEqual(success("value: {}"))
})

test('UnaryExpression', () => {
  expect(compileTSStringExpression(
    "'result: ' + (+numericString)", { deep: false }
  )).toEqual(success("result: {}"))
  expect(compileTSStringExpression(
    "'not: ' + (!boolValue)", { deep: false }
  )).toEqual(success("not: {}"))
  expect(compileTSStringExpression(
    "'type: ' + (typeof variable)", { deep: false }
  )).toEqual(success("type: {}"))
  expect(compileTSStringExpression(
    "`negative: ${-number}`", { deep: false }
  )).toEqual(success("negative: {}"))
})

test('ArrayExpression', () => {
  expect(compileTSStringExpression(
    "'values: ' + [1, 2, 3]", { deep: true }
  )).toEqual(success("values: {}"))
  expect(compileTSStringExpression(
    "`items: ${['a', 'b']}`", { deep: true }
  )).toEqual(success("items: {}"))
  expect(compileTSStringExpression(
    "'mixed: ' + [1, identifier, 'text']", { deep: false }
  )).toEqual(success("mixed: {}"))
  expect(compileTSStringExpression(
    "'empty: ' + []", { deep: true }
  )).toEqual(success("empty: {}"))
})

test('ObjectExpression', () => {
  expect(compileTSStringExpression(
    "'obj: ' + {}", { deep: true }
  )).toEqual(success("obj: {}"))
  expect(compileTSStringExpression(
    "'obj: ' + {toString: () => 'custom'}", { deep: false }
  )).toEqual(success("obj: {}"))
  expect(compileTSStringExpression(
    "`value: ${{}}`", { deep: true }
  )).toEqual(success("value: {}"))
  expect(compileTSStringExpression(
    "'obj: ' + {a: 1, b: identifier}", { deep: false }
  )).toEqual(success("obj: {}"))
})

test('ThisExpression', () => {
  expect(compileTSStringExpression(
    "'context: ' + this", { deep: false }
  )).toEqual(success("context: {}"))
  expect(compileTSStringExpression(
    "`value: ${this.property}`", { deep: false }
  )).toEqual(success("value: {}"))
  expect(compileTSStringExpression(
    "this + ' suffix'", { deep: false }
  )).toEqual(success("{} suffix"))
})

test('ArrowFunctionExpression', () => {
  expect(compileTSStringExpression(
    "'result: ' + (() => 'computed')()", { deep: true }
  )).toEqual(success("result: {}"))
  expect(compileTSStringExpression(
    "`value: ${(() => someComputation)()}`", { deep: false }
  )).toEqual(success("value: {}"))
  expect(compileTSStringExpression(
    "'calc: ' + ((x) => x * 2)(5)", { deep: true }
  )).toEqual(success("calc: {}"))
})

test('FunctionExpression', () => {
  expect(compileTSStringExpression(
    "'result: ' + (function() { return 'computed' })()", { deep: true }
  )).toEqual(success("result: {}"))
  expect(compileTSStringExpression(
    "`value: ${(function(x) { return x + 1 })(4)}`", { deep: true }
  )).toEqual(success("value: {}"))
  expect(compileTSStringExpression(
    "'fn: ' + (function named() { return 'test' })()", { deep: true }
  )).toEqual(success("fn: {}"))
})

test('TaggedTemplateExpression', () => {
  expect(compileTSStringExpression(
    "String.raw`path\\to\\file`", { deep: true }
  )).toEqual(success("{}"))
  expect(compileTSStringExpression(
    "myTag`template ${expr}`", { deep: false }
  )).toEqual(success("{}"))
  expect(compileTSStringExpression(
    "customTag`hello ${'world'}`", { deep: false }
  )).toEqual(success("{}"))
})

test('ChainExpression', () => {
  expect(compileTSStringExpression(
    "'value: ' + obj?.prop?.method?.()", { deep: false }
  )).toEqual(success("value: {}"))
  expect(compileTSStringExpression(
    "`result: ${chain?.deeply?.nested}`", { deep: false }
  )).toEqual(success("result: {}"))
  expect(compileTSStringExpression(
    "optional?.toString?.() || 'fallback'", { deep: false }
  )).toEqual(success("{}"))
})

test('MemberExpression', () => {
  expect(compileTSStringExpression(
    "'length: ' + str.length", { deep: false }
  )).toEqual(success("length: {}"))
  expect(compileTSStringExpression(
    "`char: ${str[0]}`", { deep: false }
  )).toEqual(success("char: {}"))
  expect(compileTSStringExpression(
    "'prop: ' + obj['property']", { deep: false }
  )).toEqual(success("prop: {}"))
})

test('YieldExpression', () => {
  expect(compileTSStringExpression(
    "'yielded: ' + (yield 'value')", { deep: false }
  )).toEqual(success("yielded: {}"))
  expect(compileTSStringExpression(
    "`result: ${yield * generator()}`", { deep: false }
  )).toEqual(success("result: {}"))
})

test('AwaitExpression', () => {
  expect(compileTSStringExpression(
    "'result: ' + (await promise)", { deep: false }
  )).toEqual(success("result: {}"))
  expect(compileTSStringExpression(
    "`value: ${await getValue()}`", { deep: false }
  )).toEqual(success("value: {}"))
})

test('ClassExpression', () => {
  expect(compileTSStringExpression(
    "'class: ' + (class {})", { deep: false }
  )).toEqual(success("class: {}"))
  expect(compileTSStringExpression(
    "`instance: ${new (class { toString() { return 'custom' } })()}`", { deep: false }
  )).toEqual(success("instance: {}"))
})
