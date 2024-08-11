#!/usr/bin/env node

const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const yargs = require('yargs');
const getStdin = require('get-stdin');

function findMethod(ast, methodName) {
  let foundNode = null;
  traverse(ast, {
    enter(path) {
      if (
        (t.isFunctionDeclaration(path.node) && path.node.id.name === methodName) ||
        (t.isObjectMethod(path.node) && path.node.key.name === methodName) ||
        (t.isClassMethod(path.node) && path.node.key.name === methodName)
      ) {
        foundNode = path;
        path.stop();
      }
    }
  });
  return foundNode;
}

async function spaste(filename, methodName, action) {
  const code = fs.readFileSync(filename, 'utf-8');
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy']
  });

  const methodPath = findMethod(ast, methodName);

  if (!methodPath) {
    console.error(`Method "${methodName}" not found in ${filename}`);
    process.exit(1);
  }

  switch (action) {
    case 'replace':
      const replacementCode = await getStdin();
      const replacementAst = parser.parse(replacementCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy']
      });
      methodPath.replaceWith(replacementAst.program.body[0]);
      break;
    case 'delete':
      methodPath.remove();
      break;
    case 'echo':
      const methodCode = generate(methodPath.node, {}, code).code;
      console.log(methodCode);
      return;
  }

  if (action !== 'echo') {
    const output = generate(ast, { retainLines: true }, code);
    fs.writeFileSync(filename, output.code);
    console.log(`Method "${methodName}" has been ${action}d in ${filename}`);
  }
}

yargs
  .command('$0 <filename>', 'Operate on a method in a JavaScript file', (yargs) => {
    yargs
      .positional('filename', {
        describe: 'The JavaScript file to operate on',
        type: 'string'
      })
      .option('r', {
        alias: 'replace',
        describe: 'Replace the specified method with stdin content',
        type: 'string'
      })
      .option('d', {
        alias: 'delete',
        describe: 'Delete the specified method',
        type: 'string'
      })
      .option('e', {
        alias: 'echo',
        describe: 'Echo the specified method',
        type: 'string'
      });
  }, async (argv) => {
    const { filename } = argv;
    if (argv.r) {
      await spaste(filename, argv.r, 'replace');
    } else if (argv.d) {
      await spaste(filename, argv.d, 'delete');
    } else if (argv.e) {
      await spaste(filename, argv.e, 'echo');
    } else {
      console.error('Please specify an action: -r, -d, or -e');
      process.exit(1);
    }
  })
  .help()
  .argv;