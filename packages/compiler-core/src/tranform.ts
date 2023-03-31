import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform (root, options = {}) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
  createCodegenNode(root);
  root.helpers = [...context.helpers.keys()];
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper (key) {
      context.helpers.set(key, 1)
    }
  };
  return context;
}

function traverseNode(node: any, context: any) {
  const nodeTransforms = context.nodeTransforms;
  const exitFns: any = [];
  if (nodeTransforms.length > 0) {
    for (let index = 0; index < nodeTransforms.length; index++) {
      const plugin = nodeTransforms[index];
      const onExit  = plugin(node, context);
      if (onExit) exitFns.push(onExit);
    }
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      const { helper } = context;
      helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      traverseChildren(node, context);
      break;
    default:
      break;
  }
  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}


function traverseChildren (node, context) {
  const children = node.children;
  for (let index = 0; index < children.length; index++) {
    const transform = children[index];
    traverseNode(transform, context)
  }
}
function createCodegenNode(root: any) {
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode
  } else {
    root.codegenNode = root.children[0];
  }
}

