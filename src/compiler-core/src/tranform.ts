export function transform (root, options) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
  return context;
}

function traverseNode(node: any, context: any) {
  const nodeTransforms = context.nodeTransforms;
  if (nodeTransforms.length > 0) {
    for (let index = 0; index < nodeTransforms.length; index++) {
      const plugin = nodeTransforms[index];
      plugin(node);
    }
  }

  traverseChildren(node, context)
}


function traverseChildren (node, context) {
  const children = node.children;
  
  if (children) {
    for (let index = 0; index < children.length; index++) {
      const transform = children[index];
      traverseNode(transform, context)
    }
  }
}
