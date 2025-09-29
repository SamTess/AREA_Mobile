## Using the "use-gluestack-components" tool

This project includes a local helper tool to speed up adding Gluestack UI components. It relies on an MCP (Model Context Protocol) server declared in `.vscode/mcp.json` under the key `use-gluestack-components`.

### What the tool does

- Generates prebuilt UI snippets (Gluestack UI + NativeWind)
- Respects the existing `components/ui/*` structure
- Can insert required imports/boilerplate

### Requirements

- VS Code
- GitHub Copilot (or another MCP-capable client) enabled
- Node.js installed (the tool is run via `node`)

MCP mapping is configured here:

- `.vscode/mcp.json`
  ```jsonc
  {
    "servers": {
      "use-gluestack-components": {
        "type": "stdio",
        "command": "node",
        "args": ["/absolute/path/to/your/mcp/index.js"]
      }
    }
  }
  ```

Make sure the path to `index.js` exists and points to your local MCP script. If you use a different location, update `args` accordingly.

### How to use it in VS Code

1) Open this repository in VS Code.
2) Ensure Copilot/your MCP client detects the `use-gluestack-components` server (it may appear in the Copilot tools list).
3) In a TS/TSX file, ask Copilot to insert a component. Example prompts:

   - "Add a primary Gluestack button to this screen using the use-gluestack-components tool"
   - "Generate a stacked Input + Button (VStack) with default Gluestack styles"

4) The tool will propose code (imports from `@/components/ui/*`, prop types, etc.). Review and accept.

### Manual integration example

Even without the tool, you can use existing components directly:

```tsx
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export function MySection() {
  return (
    <VStack space="md">
      <Text size="lg" className="font-semibold">Title</Text>
      <Button onPress={() => console.log('clicked')}>
        <Button.Text>Action</Button.Text>
      </Button>
    </VStack>
  );
}
```

### Best practices

- Use `GluestackUIProvider` (already wired in `app/_layout.tsx`).
- Prefer components from `@/components/ui/*` for consistency.
- If the tool generates new files, validate the `@/` alias imports (configured via `babel-plugin-module-resolver`).

### Troubleshooting

- If the tool doesn’t show up: open `.vscode/mcp.json` and confirm the `args` path. Restart VS Code.
- If generated code references paths that don’t exist, adapt them to your actual `components/ui/` folder structure.
