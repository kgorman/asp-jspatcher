const { validateJavaScript, injectFunction, processFiles } = require('./asp-jspatcher.js');
const fs = require('fs');

console.log('🧪 Running tests for asp-inject...\n');

// Test 1: JavaScript validation
console.log('Test 1: JavaScript validation');
try {
  validateJavaScript('function test() { return 42; }');
  console.log('✅ Valid JavaScript passed');
} catch (error) {
  console.log('❌ Valid JavaScript failed:', error.message);
}

try {
  validateJavaScript('function test() { return 42; ');
  console.log('❌ Invalid JavaScript passed when it should have failed');
} catch (error) {
  console.log('✅ Invalid JavaScript correctly rejected:', error.message);
}

// Test 2: Function injection
console.log('\nTest 2: Function injection');
const testJson = '{"function": "$$FUNCTION", "other": "value"}';
const testJs = 'function() { return "hello"; }';

try {
  const result = injectFunction(testJson, testJs);
  const parsed = JSON.parse(result);
  console.log('✅ Function injection successful');
  console.log('   Result:', result);
} catch (error) {
  console.log('❌ Function injection failed:', error.message);
}

// Test 3: Missing keyword
console.log('\nTest 3: Missing keyword handling');
try {
  injectFunction('{"no": "keyword"}', testJs);
  console.log('❌ Should have failed with missing keyword');
} catch (error) {
  console.log('✅ Correctly detected missing keyword:', error.message);
}

// Test 4: Custom keyword
console.log('\nTest 4: Custom keyword');
try {
  const result = injectFunction('{"func": "%%CUSTOM%%"}', testJs, '%%CUSTOM%%');
  console.log('✅ Custom keyword worked');
} catch (error) {
  console.log('❌ Custom keyword failed:', error.message);
}

console.log('\n🏁 Tests completed!');