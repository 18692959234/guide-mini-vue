export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;
  push('return ');
  
  const functionName = 'render';
  const args = ['_ctx', '_cache'];
  const signature = args.join(', ');
  push(`function ${functionName} (${signature}) {`);
  genNode(ast, context);
  push(`}`);
  return {code: context.code};
}

function genNode (ast, context) {
  const node = ast.codegenNode;
  context.push(`return '${node.content}'`);
  return context.code;
}

function createCodegenContext () {
  const context = {
    code: '',
    push (source) {
      context.code += source;
    }
  }
  return context;
}