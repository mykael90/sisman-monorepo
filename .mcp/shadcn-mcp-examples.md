# Shadcn UI v4 MCP Server

## 🎯 Usage Examples

### Getting Component Source Code

Ask your AI assistant:
```
"Show me the source code for the shadcn/ui button component"
```

The AI can now access the complete TypeScript source code for the button component.

### Creating a Dashboard

Ask your AI assistant:
```
"Create a dashboard using shadcn/ui components. Use the dashboard-01 block as a starting point"
```

The AI can retrieve the complete dashboard block implementation and customize it for your needs.

### Building a Login Form

Ask your AI assistant:
```
"Help me build a login form using shadcn/ui components. Show me the available form components"
```

The AI can list all available components and help you build the form.

## 🛠️ Available Tools

The MCP server provides these tools for AI assistants:

### Component Tools

- **`get_component`** - Get component source code
- **`get_component_demo`** - Get component usage examples
- **`list_components`** - List all available components
- **`get_component_metadata`** - Get component dependencies and info

### Block Tools

- **`get_block`** - Get complete block implementations (dashboard-01, calendar-01, etc.)
- **`list_blocks`** - List all available blocks with categories

### Repository Tools

- **`get_directory_structure`** - Explore the shadcn/ui repository structure

### Example Tool Usage

```typescript
// These tools can be called by AI assistants via MCP protocol

// Get button component source
{
  "tool": "get_component",
  "arguments": { "componentName": "button" }
}

// List all components
{
  "tool": "list_components",
  "arguments": {}
}

// Get dashboard block
{
  "tool": "get_block", 
  "arguments": { "blockName": "dashboard-01" }
}
```