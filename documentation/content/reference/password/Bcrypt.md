---
type: "class"
node: true
implements: "PasswordHashingAlgorithm"
implements_link: "ref:password"
---

# `Bcrypt`

Provides methods for hashing passwords and verifying hashes with [bcrypt](). By default, the configuration is set to [the recommended values](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

**We recommend using [Argon2id]() or [Scrypt]() if possible.**

## Constructor

```ts
function constructor(options?: { cost?: number }): this;
```

- `options`
  - `cost` (default: `10`)

## Methods

- [PasswordHashingAlgorithm.hash](ref:password)
- [PasswordHashingAlgorithm.verify](ref:password)

## Example

```ts
import { Bcrypt } from "oslo/password";

const bcrypt = new Bcrypt();
const hash = await bcrypt.hash(password);
const validPassword = await bcrypt.verify(hash, password);
```