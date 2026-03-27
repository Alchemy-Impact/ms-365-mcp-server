# JSON String Body Parameters for Copilot Studio

## Overview

The MCP server has been updated to accept body parameters as JSON strings instead of complex nested objects. This change makes it significantly easier for Copilot Studio to work with Microsoft Graph API calls that require request bodies.

## What Changed

### Before
Body parameters were exposed as complex nested object schemas:

```typescript
{
  "body": {
    "subject": "string",
    "toRecipients": [
      {
        "emailAddress": {
          "address": "string"
        }
      }
    ],
    "body": {
      "contentType": "html",
      "content": "string"
    }
  }
}
```

Copilot Studio struggled to populate these complex nested structures correctly.

### After
Body parameters are now exposed as simple string parameters with the JSON schema documented in the description:

```typescript
{
  "body": "string" // Description includes the full JSON schema
}
```

## How It Works

1. **Tool Registration**: When tools are registered, body parameters are detected and replaced with a string schema
2. **Schema Documentation**: The original Zod schema is converted to JSON Schema format and included in the parameter description
3. **Runtime Parsing**: When a tool is called, if the body parameter is a string, it's automatically parsed as JSON before validation
4. **Validation**: The parsed JSON is validated against the original schema to ensure correctness

## Example Usage

### Creating a Draft Email

**Tool Name**: `create-draft-email`

**Parameter**: `body` (string)

**Value** (as a JSON string):
```json
{
  "subject": "Meeting Tomorrow",
  "body": {
    "contentType": "html",
    "content": "<h1>Hi Team</h1><p>Let's meet tomorrow at 10 AM.</p>"
  },
  "toRecipients": [
    {
      "emailAddress": {
        "address": "colleague@example.com"
      }
    }
  ]
}
```

In Copilot Studio, you would:
1. Identify the JSON structure from the tool's parameter description
2. Build the JSON object as a string
3. Pass it as the `body` parameter value

## Benefits for Copilot Studio

1. **Simpler Interface**: Single string parameter instead of complex nested objects
2. **Clear Documentation**: Full JSON schema structure is visible in parameter descriptions
3. **Flexibility**: Copilot can construct the JSON string programmatically
4. **Validation**: Still maintains full schema validation at runtime

## Implementation Details

### Modified Files
- `src/graph-tools.ts`: Added JSON string parsing logic and schema conversion

### Key Functions
1. **Parameter Schema Building** (line ~474):
   - Detects Body parameters
   - Converts Zod schema to JSON Schema
   - Creates string parameter with schema in description

2. **Body Parameter Parsing** (line ~188):
   - Checks if parameter value is a string
   - Parses JSON if applicable
   - Validates against original schema

### Dependencies
- `zod-to-json-schema`: Converts Zod schemas to JSON Schema format for documentation

## Testing

New test suite added in `test/json-string-body.test.ts` covering:
- Schema conversion
- JSON string parsing
- Validation
- Error handling

All tests pass successfully.
