import { createVNodeCall, NodeTypes } from "../ast";

export function transformElement (node, context) {
  return () => {
    if (node.type === NodeTypes.ELEMENT) {
      // tag
      const vnodeTag = `'${node.tag}'`;
  
      // props
      let vnodeProps;
  
      // children
      const children = node.children;
      let vnodeChildren = children[0];
  
  
      node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
    }
  }
}