# spaste-cli

`spaste-cli` is a command-line tool for smart manipulation of JavaScript methods in files. It allows you to easily replace, delete, or echo specific methods in your JavaScript code using the power of Abstract Syntax Trees (AST).

## Features

- Replace a method with new content from stdin
- Delete a specific method from a file
- Echo the content of a specific method
- Preserves overall file structure and formatting
- Works with various method types (function declarations, object methods, class methods)

## Installation

You can install `spaste-cli` globally using npm:

```bash
npm install -g spaste-cli
```

## Usage

After installation, you can use the `spaste` command in your terminal.

### Replace a method

To replace a method with new content from stdin:

```bash
pbpaste | spaste index.js -r myMethod
```

This command replaces the `myMethod` in `index.js` with the content from your clipboard.

### Delete a method

To delete a specific method:

```bash
spaste index.js -d myMethod
```

This command removes the `myMethod` from `index.js`.

### Echo a method

To print the content of a specific method:

```bash
spaste index.js -e myMethod
```

This command outputs the content of `myMethod` from `index.js` to the console.

## Options

- `-r, --replace <method>`: Replace the specified method with stdin content
- `-d, --delete <method>`: Delete the specified method
- `-e, --echo <method>`: Echo the specified method

## Examples

1. Replace a method with content from a file:
   ```bash
   cat new_method.js | spaste index.js -r oldMethod
   ```

2. Delete a method named 'deprecatedFunction':
   ```bash
   spaste app.js -d deprecatedFunction
   ```

3. View the content of a method named 'initialize':
   ```bash
   spaste main.js -e initialize
   ```

## Examples with LLM Prompting

`spaste-cli` can be particularly powerful when used in combination with [Large Language Models (LLMs)](https://llm.datasette.io/en/stable/) for code generation and modification. Here are some examples:

### Optimizing an Existing Method

```bash
spaste myfile.js -e slowMethod | llm "Optimize this JavaScript method for better performance" | spaste myfile.js -r slowMethod
```

This pipeline extracts a method, sends it to an LLM for optimization, and then replaces the original method with the optimized version.

### Adding Error Handling

```bash
spaste myfile.js -e userInputMethod | llm "Add robust error handling to this method" | spaste myfile.js -r userInputMethod
```

This example takes an existing method, asks an LLM to add error handling, and then updates the file with the improved method.

### Generating Unit Tests

```bash
spaste myfile.js -e targetMethod | llm "Write Jest unit tests for this method" >> tests/targetMethod.test.js
```

This command extracts a method, uses an LLM to generate unit tests for it, and appends those tests to a test file.

### Refactoring for a New Feature

```bash
spaste myfile.js -e oldMethod | llm "Refactor this method to include a new parameter 'options' for additional configuration" | spaste myfile.js -r oldMethod
```

This example extracts a method, asks an LLM to refactor it to include a new feature, and then updates the file with the refactored method.

These examples demonstrate how `spaste-cli` can be seamlessly integrated with LLM tools to automate various code modification tasks. By combining the power of AI-generated code suggestions with precise method manipulation, developers can significantly streamline their workflow.

## Requirements

- Node.js >= 12.0.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
