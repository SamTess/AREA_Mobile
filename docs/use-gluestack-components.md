## Utiliser l’outil « use-gluestack-components » (FR)

Ce projet est équipé d’un outil local pour accélérer l’ajout de composants Gluestack UI. Il s’appuie sur un serveur MCP (Model Context Protocol) déclaré dans `.vscode/mcp.json` sous la clé `use-gluestack-components`.

### Ce que fait l’outil

- Génère des composants UI prédéfinis (basés sur Gluestack UI + NativeWind)
- Respecte la structure `components/ui/*` existante
- Peut insérer les imports/boilerplate nécessaires

### Prérequis

- VS Code
- Extension « GitHub Copilot » (ou cliente MCP compatible) activée
- Node.js installé (l’outil est lancé via `node`)

Le mapping MCP est configuré ici:

- `.vscode/mcp.json`
  ```jsonc
  {
    "servers": {
      "use-gluestack-components": {
        "type": "stdio",
        "command": "node",
        "args": ["/home/carlossobuaro/mcp/index.js"]
      }
    }
  }
  ```

Assurez-vous que le chemin vers `index.js` existe et pointe vers votre script MCP local. Si vous utilisez un autre emplacement, mettez à jour `args` en conséquence.

### Comment l’utiliser dans VS Code

1) Ouvrez ce repository dans VS Code.
2) Vérifiez que Copilot/Client MCP a bien détecté le serveur « use-gluestack-components » (il peut apparaître dans la liste des outils Copilot).
3) Dans un fichier TS/TSX, demandez à Copilot d’insérer un composant. Exemple de prompt:

   - « Ajoute un bouton Gluestack primaire dans ce screen en utilisant l’outil use-gluestack-components »
   - « Génère un Input + Button empilés (VStack) avec styles par défaut Gluestack »

4) L’outil va proposer le code (imports depuis `@/components/ui/*`, props types, etc.). Relisez puis acceptez.

### Exemple d’intégration manuelle

Même sans l’outil, vous pouvez utiliser les composants déjà présents:

```tsx
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export function MySection() {
  return (
    <VStack space="md">
      <Text size="lg" className="font-semibold">Titre</Text>
      <Button onPress={() => console.log('clicked')}>
        <Button.Text>Action</Button.Text>
      </Button>
    </VStack>
  );
}
```

### Bonnes pratiques

- Utilisez `GluestackUIProvider` (déjà câblé dans `app/_layout.tsx`).
- Préférez les composants depuis `@/components/ui/*` pour rester cohérent.
- Si l’outil génère de nouveaux fichiers, validez les imports alias `@/` (configuré via `babel-plugin-module-resolver`).

### Dépannage

- Si l’outil n’apparaît pas: ouvrez `.vscode/mcp.json` et confirmez le chemin `args`. Redémarrez VS Code.
- Si le code généré référence des chemins inexistants, adaptez-les à la structure réelle du dossier `components/ui/`.
