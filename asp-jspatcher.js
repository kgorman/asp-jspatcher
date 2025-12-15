#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Default replacement keyword
const DEFAULT_REPLACEMENT_KEYWORD = '$$FUNCTION';

/**
 * Validates JavaScript code syntax
 * @param {string} jsCode - JavaScript code to validate
 * @returns {boolean} - True if valid, throws error if invalid
 */
function validateJavaScript(jsCode) {
  try {
    // Try as-is first (for function expressions)
    new Function('return (' + jsCode + ')');
    return true;
  } catch (firstError) {
    try {
      // Try as function body (for function statements)
      new Function(jsCode);
      return true;
    } catch (secondError) {
      throw new Error(`Invalid JavaScript syntax: ${firstError.message}`);
    }
  }
}

/**
 * Replaces placeholder in JSON with JavaScript function
 * @param {string} jsonContent - JSON content as string
 * @param {string} jsContent - JavaScript content to inject
 * @param {string} keyword - Replacement keyword (default: $$FUNCTION)
 * @returns {string} - Modified JSON content
 */
function injectFunction(jsonContent, jsContent, keyword = DEFAULT_REPLACEMENT_KEYWORD) {
  // Validate that the keyword exists in the JSON
  if (!jsonContent.includes(keyword)) {
    throw new Error(`Replacement keyword "${keyword}" not found in JSON file`);
  }

  // Replace the keyword with the JavaScript function
  // We need to properly escape the JS content for JSON
  const escapedJsContent = JSON.stringify(jsContent);
  
  // Remove the outer quotes since we're replacing a placeholder that's already quoted
  const jsContentForReplacement = escapedJsContent.slice(1, -1);
  
  // Replace all occurrences of the keyword
  return jsonContent.replace(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), jsContentForReplacement);
}

/**
 * Main function to process files
 * @param {string} jsonFilePath - Path to JSON file
 * @param {string} jsFilePath - Path to JavaScript file
 * @param {string} outputPath - Output path (optional)
 * @param {string} keyword - Replacement keyword (optional)
 */
async function processFiles(jsonFilePath, jsFilePath, outputPath, keyword = DEFAULT_REPLACEMENT_KEYWORD) {
  try {
    // Validate file paths
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`JSON file not found: ${jsonFilePath}`);
    }
    
    if (!fs.existsSync(jsFilePath)) {
      throw new Error(`JavaScript file not found: ${jsFilePath}`);
    }

    // Read files
    const jsonContent = await readFile(jsonFilePath, 'utf8');
    const jsContent = await readFile(jsFilePath, 'utf8');

    // Validate JSON
    try {
      JSON.parse(jsonContent);
    } catch (error) {
      throw new Error(`Invalid JSON in file ${jsonFilePath}: ${error.message}`);
    }

    // Validate JavaScript
    validateJavaScript(jsContent);

    // Inject function into JSON
    const result = injectFunction(jsonContent, jsContent, keyword);

    // Validate resulting JSON
    try {
      JSON.parse(result);
    } catch (error) {
      throw new Error(`Resulting JSON is invalid after injection: ${error.message}`);
    }

    // Output result
    if (outputPath) {
      await writeFile(outputPath, result);
      console.log(`✅ Successfully injected function into ${outputPath}`);
    } else {
      console.log(result);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
    console.log(`
asp-inject - Inject validated JavaScript into ASP pipeline definitions

Usage:
  asp-inject <json-file> <js-file> [options]

Arguments:
  json-file    Path to the ASP pipeline JSON file
  js-file      Path to the JavaScript function file

Options:
  -o, --output <file>     Output file path (default: stdout)
  -k, --keyword <word>    Replacement keyword (default: ${DEFAULT_REPLACEMENT_KEYWORD})
  -h, --help             Show this help message

Examples:
  asp-inject pipeline.json function.js
  asp-inject pipeline.json function.js -o output.json
  asp-inject pipeline.json function.js -k "%%CUSTOM%%" -o result.json
`);
    process.exit(0);
  }

  const config = {
    jsonFile: args[0],
    jsFile: args[1],
    output: null,
    keyword: DEFAULT_REPLACEMENT_KEYWORD
  };

  // Parse options
  for (let i = 2; i < args.length; i++) {
    switch (args[i]) {
      case '-o':
      case '--output':
        config.output = args[++i];
        break;
      case '-k':
      case '--keyword':
        config.keyword = args[++i];
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }

  return config;
}

// Main execution
if (require.main === module) {
  const config = parseArgs();
  processFiles(config.jsonFile, config.jsFile, config.output, config.keyword);
}

module.exports = {
  validateJavaScript,
  injectFunction,
  processFiles
};