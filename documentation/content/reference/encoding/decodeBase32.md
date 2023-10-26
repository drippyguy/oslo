---
type: "function"
---

Decodes base32 strings. This does not check the length and ignores padding. Use [`encodeBase32()`](ref:crypto) to encode into base32 strings.

```ts
function decodeBase32(encoded: string): Uint8Array;
```

- `encoded`

## Example

```ts
import { decodeBase32 } from "oslo/encoding";

const data = decodeBase32(encoded);
const text = new TextDecoder().decode(data);
```