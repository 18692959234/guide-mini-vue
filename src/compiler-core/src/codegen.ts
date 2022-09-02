import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import { CREATE_ELEMENT_VNODE, helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";

export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;
  genFunctionPreamble(context, ast);
  const functionName = 'render';
  const args = ['_ctx', '_cache'];
  const signature = args.join(', ');
  push(`function ${functionName} (${signature}) {`);
  push("return ");
  genNode(ast.codegenNode, context);
  push(`}`);
  return {code: context.code};
}

function genNode (node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
    default:
      break;
  }
}

function createCodegenContext () {
  const context = {
    code: '',
    push (source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  }
  return context;
}

function genFunctionPreamble(context, ast) {
  const {push} = context;
  const helpers = ast.helpers;
  if (helpers.length > 0) {
    const VueBinging = 'Vue';
    const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;
    push(`const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinging}`);
  }
  push('\n')
  push(`return `)
}

function genText(node: any, context: any) {
  const {push} = context;
  push(`'${node.content}'`);
}

function genInterpolation(node: any, context: any) {
  const {push, helper} = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content,context)
  push(`)`)
}

function genExpression(node: any, context: any) {
  const { push } = context;
  push(node.content)
}


function genElement (node: any, context: any) {
  const { push, helper } = context;
  const { tag, children, props } = node;
  push(`${helper(CREATE_ELEMENT_VNODE)}(`);
  genNodeList(genNullable([tag, props, children]), context);
  push(")");
}

function genNodeList(nodes, context) {
  const { push } = context;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      push(node);
    } else {
      genNode(node, context);
    }

    if(i < nodes.length -1){
      push(", ")
    }
  }
}

function genNullable(args: any) {
  return args.map((arg) => arg || "null");
}

function genCompoundExpression(node: any, context: any) {
  const children = node.children;
  const { push } = context;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
  }
}

