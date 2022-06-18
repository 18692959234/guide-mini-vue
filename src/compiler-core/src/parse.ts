import { NodeTypes } from "./ast";

type parseContext = {source: string}

const enum TagTypes {
  Start,
  End
}

export function baseParse (content) {
  const context: parseContext = createParserContext(content);
  return createRoot(parseChildren(context));
}

function parseChildren (context) {
  const nodes:any = [];

  let node;
  const s = context.source;
  if (s.startsWith('{{')) {
    node = parseInterpolation(context);
  } else if (s[0] === '<') {
    node = parseElement(context);
  }

  nodes.push(node);

  return nodes;
}

function parseInterpolation (context) {

  const openDelimiter = '{{';
  const closeDelimiter = '}}';
  const openDelimiterLen = openDelimiter.length;
  const closeDelimiterLen = closeDelimiter.length;

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiterLen);
  
  advanceBy(context, openDelimiterLen)

  const rawContentLength = closeIndex - openDelimiterLen;

  const rawContent = context.source.slice(0, rawContentLength);

  const content = rawContent.trim()
  // {{message}} -> message
  advanceBy(context, rawContentLength + closeDelimiterLen);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  }
}

function advanceBy (context, len: number) {
  context.source = context.source.slice(len)
}

function createRoot (children) {
  return {
    children
  }
}

function createParserContext (content) {
  return {
    source: content
  }
}

function parseElement(context): any {
  

  const element = parseTag(context, TagTypes.Start);

  parseTag(context, TagTypes.End);
  return element;
}


function parseTag (context, type: TagTypes) {
  const match:any = /\<\/?([a-z]*)/.exec(context.source);

  advanceBy(context, match[0].length)
  advanceBy(context, 1);
  if (type === TagTypes.End) return;
  return {
    type: NodeTypes.ELEMENT,
    tag: "div",
  }
}