const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

const spasteCmd = 'node ' + path.resolve(__dirname, 'index.js');

describe('spaste-cli', () => {
  let tmpDir;
  let testFilePath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spaste-test-'));
    testFilePath = path.join(tmpDir, 'test.js');
    const testFileContent = `
      function testMethod() {
        console.log('This is a test method');
      }

      const objMethod = {
        testObjMethod() {
          console.log('This is a test object method');
        }
      };

      class TestClass {
        testClassMethod() {
          console.log('This is a test class method');
        }
      }
    `;
    fs.writeFileSync(testFilePath, testFileContent);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('echo method content', (done) => {
    exec(`${spasteCmd} ${testFilePath} -e testMethod`, (error, stdout, stderr) => {
      expect(error).toBeNull();
      expect(stderr).toBe('');
      expect(stdout.trim()).toBe('function testMethod() {\n        console.log(\'This is a test method\');\n      }');
      done();
    });
  });

  test('delete method', (done) => {
    exec(`${spasteCmd} ${testFilePath} -d testMethod`, (error, stdout, stderr) => {
      expect(error).toBeNull();
      expect(stderr).toBe('');
      expect(stdout.trim()).toBe(`Method "testMethod" has been deleted in ${testFilePath}`);
      
      const fileContent = fs.readFileSync(testFilePath, 'utf-8');
      expect(fileContent).not.toContain('function testMethod()');
      done();
    });
  });

  test('replace method', (done) => {
    const newMethod = 'function testMethod() { console.log("This is the new method"); }';
    exec(`echo '${newMethod}' | ${spasteCmd} ${testFilePath} -r testMethod`, (error, stdout, stderr) => {
      expect(error).toBeNull();
      expect(stderr).toBe('');
      expect(stdout.trim()).toBe(`Method "testMethod" has been replaced in ${testFilePath}`);
      
      const fileContent = fs.readFileSync(testFilePath, 'utf-8');
      expect(fileContent).toContain('This is the new method');
      expect(fileContent).not.toContain('This is a test method');
      done();
    });
  });

  test('handle non-existent method', (done) => {
    exec(`${spasteCmd} ${testFilePath} -e nonExistentMethod`, (error, stdout, stderr) => {
      expect(error).not.toBeNull();
      expect(stderr).toContain('Method "nonExistentMethod" not found');
      done();
    });
  });
});
