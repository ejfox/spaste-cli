#!/usr/bin/env node

const fs = require('fs');
const jscodeshift = require('jscodeshift');
const yargs = require('yargs');
const getStdin = require('get-stdin');

/**
 * Finds a method in the AST by its name.
 * 
 * @param {Object} ast - The AST to search within.
 * @param {string} methodName - The name of the method to find.
 * @returns {Object|null} - The found method node or null if not found.
 */
function findMethod(ast, methodName) {
  let foundNode = null;
  jscodeshift(ast)
    .find(jscodeshift.FunctionDeclaration, { id: { name: methodName } })
    .forEach(path => {
      foundNode = path;
      path.stop();
    });

  if (!foundNode) {
    jscodeshift(ast)
      .find(jscodeshift.ObjectMethod, { key: { name: methodName } })
      .forEach(path => {
        foundNode = path;
        path.stop();
      });
  }

  if (!foundNode) {
    jscodeshift(ast)
      .find(jscodeshift.ClassMethod, { key: { name: methodName } })
      .forEach(path => {
        foundNode = path;
        path.stop();
      });
  }

  return foundNode;
}

/**
 * Performs the specified action (replace, delete, echo) on a method in a JavaScript file.
 * 
 * @param {string} filename - The name of the file to operate on.
 * @param {string} methodName - The name of the method to operate on.
 * @param {string} action - The action to perform (replace, delete, echo).
 */
async function spaste(filename, methodName, action) {
  const code = fs.readFileSync(filename, 'utf-8');
  const ast = jscodeshift(code);

  const methodPath = findMethod(ast, methodName);

  if (!methodPath) {
    console.error(`Method "${methodName}" not found in ${filename}`);
    process.exit(1);
  }

  switch (action) {
    case 'replace':
      const replacementCode = await getStdin();
      const replacementAst = jscodeshift(replacementCode);
      methodPath.replaceWith(replacementAst.nodes()[0]);
      break;
    case 'delete':
      methodPath.remove();
      break;
    case 'echo':
      const methodCode = methodPath.toSource();
      console.log(methodCode);
      return;
  }

  if (action !== 'echo') {
    const output = ast.toSource({ quote: 'single' });
    fs.writeFileSync(filename, output);
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
