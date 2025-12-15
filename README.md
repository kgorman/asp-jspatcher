# asp-inject

A CLI tool for validating JavaScript files and injecting them into MongoDB Atlas Stream Processing pipeline definitions.

## What it does

- Validates JavaScript syntax and ASP-specific requirements
- Injects validated JS into designated placeholders in ASP pipeline definitions
- Ensures your stream processing pipelines are valid before deployment

## Use cases

- Local development and testing of ASP pipelines
- CI/CD pipeline validation
- Templating complex stream processing definitions with reusable JS components

## Installation

### Quick Start
```bash
# Clone the repository
git clone https://github.com/kgorman/asp-jspatcher.git
cd asp-jspatcher

# Make the script executable
chmod +x asp-jspatcher.js

# Test with the included example
./asp-jspatcher.js examples/solar-boost-template.json examples/solar-boost.js -o my-pipeline.json
```

### Global Installation
```bash
# Link globally for system-wide access
npm link

# Now you can use 'asp-inject' from anywhere
asp-inject pipeline.json function.js -o output.json
```

## Quick Example

Try this example to see the tool in action:

```bash
# This will inject the solar boost function into the template and save the result
./asp-jspatcher.js examples/solar-boost-template.json examples/solar-boost.js -o complete-pipeline.json

# View the result
cat complete-pipeline.json
```

This takes a template pipeline with a `$$FUNCTION` placeholder and replaces it with validated JavaScript code.

## Usage

```bash
asp-inject <json-file> <js-file> [options]

Arguments:
  json-file    Path to the ASP pipeline JSON file with $$FUNCTION placeholder
  js-file      Path to the JavaScript function file

Options:
  -o, --output <file>     Output file path (default: stdout)
  -k, --keyword <word>    Replacement keyword (default: $$FUNCTION)
  -h, --help             Show help message
```

## Examples

### Basic Usage

```bash
# Inject function and output to stdout
./asp-jspatcher.js examples/solar-boost-template.json examples/solar-boost.js

# Inject function and save to file
./asp-jspatcher.js examples/solar-boost-template.json examples/solar-boost.js -o output.json

# If globally installed
asp-inject examples/solar-boost-template.json examples/solar-boost.js -o output.json
```

### Solar Panel Example

**Template file (`solar-boost-template.json`):**
```json
{
    "name": "solar_watts_boost_processor",
    "pipeline": [
        {
            "$source": {
                "connectionName": "sample_stream_solar",
                "timeField": { "$dateFromString": { "dateString": "$timestamp" }}
            }
        },
        {
            "$addFields": {
                "boosted_watts": {
                    "$function": {
                        "body": "$$FUNCTION",
                        "args": ["$obs.watts"],
                        "lang": "js"
                    }
                }
            }
        },
        {
            "$merge": {
                "into": {
                    "connectionName": "Cluster01",
                    "db": "test",
                    "coll": "function_test"
                }
            }
        }
    ]
}
```

**JavaScript function (`solar-boost.js`):**
```javascript
function(watts) {
  // Boost solar panel output by 20%
  return watts * 1.2;
}
```

**Command:**
```bash
asp-inject examples/solar-boost-template.json examples/solar-boost.js -o solar-boost-complete.json
```

**Result (`solar-boost-complete.json`):**
The `$$FUNCTION` placeholder is replaced with the validated JavaScript function, properly escaped for JSON.

### Custom Replacement Keyword

```bash
# Use a custom placeholder keyword
asp-inject pipeline.json function.js -k "%%MY_FUNCTION%%" -o result.json
```

## File Structure

```
examples/
├── solar-boost-template.json    # Template with $$FUNCTION placeholder
├── solar-boost.js              # JavaScript function to inject
├── solar-boost-complete.json   # Example of final result
├── pipeline.json               # More complex example template
└── function.js                 # More complex example function
```

## Features

- **Zero dependencies** - Uses only Node.js built-in modules
- **JavaScript validation** - Ensures your JS is syntactically correct before injection
- **JSON validation** - Validates both input and output JSON
- **Custom keywords** - Use any placeholder keyword you prefer
- **Error handling** - Clear error messages for common issues
- **CLI-friendly** - Works great in scripts and CI/CD pipelines
A CLI tool for validating JavaScript files and injecting them into MongoDB Atlas Stream Processing pipeline definitions.
