import { NodeTypes } from "./ast";

type parseContext = {source: string}

const enum TagTypes {
  Start,
  End
}

export function baseParse (content) {
  const context: parseContext = createParserContext(content);
  return createRoot(parseChildren(context, []));
}

function parseChildren (context, ancestors) {
  const nodes:any = [];
  while(!isEnd(context, ancestors)) {
    let node;
    const s = context.source;
    if (s.startsWith('{{')) {
      node = parseInterpolation(context);
    } else if (s[0] === '<') {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors);
      }
    }
  
    if (!node) {
      node = parseText(context);
    }
    nodes.push(node)
  }

  return nodes;
}

function isEnd (context, ancestors) {
  const s = context.source;
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if (startsWithEndTagOpen(s, tag)) {
        return true;
      }
    }
  }

  return !s;
}

function parseInterpolation (context) {

  const openDelimiter = '{{';
  const closeDelimiter = '}}';
  const openDelimiterLen = openDelimiter.length;
  const closeDelimiterLen = closeDelimiter.length;

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiterLen);
  
  advanceBy(context, openDelimiterLen)

  const rawContentLength = closeIndex - openDelimiterLen;

  const rawContent = parseTextData(context, rawContentLength);

  const content = rawContent.trim()
  // {{message}} -> message
  advanceBy(context, closeDelimiterLen);

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
    children,
    type: NodeTypes.ROOT
  }
}

function createParserContext (content) {
  return {
    source: content
  }
}

function parseElement(context, ancestors): any {
  

  const element: any = parseTag(context, TagTypes.Start);
  
  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();
  console.log('-----',context.source,  element.tag, ancestors)
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagTypes.End);
  } else {
    throw new Error(`缺少结束标签:${element.tag}`);
  }
  return element;
}

function startsWithEndTagOpen(source, tag) {
  return (
    source.startsWith("</") &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  );
}


function parseTag (context, type: TagTypes) {
  const match:any = /\<\/?([a-z]*)/.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length)
  advanceBy(context, 1);
  if (type === TagTypes.End) return;
  return {
    type: NodeTypes.ELEMENT,
    tag,
  }
}

function parseText(context: any): any {
  const endTokens = ['<', "{{",];
  const s = context.source;
  let endIndex = s.length;
  for (let i = 0; i < endTokens.length; i++) {
    const index = s.indexOf(endTokens[i]);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex);
  return {
    type: NodeTypes.TEXT,
    content,
  }
}

function parseTextData (context, length) {
  const content = context.source.slice(0, length);
  advanceBy(context, length);
  return content
}
