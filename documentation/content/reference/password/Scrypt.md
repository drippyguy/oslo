---
type: "class"
node: true
implements: "PasswordHashingAlgorithm"
implements_link: "ref:password"
---

# `Scrypt`

Provides methods for hashing passwords and verifying hashes with [scrypt](). By default, the configuration is set to [the recommended values](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

We recommend using [Argon2id]() if possible.

The output hash is a combination of the scrypt hash and the 32-bytes salt, in the format of `<salt>:<hash>`.

## Constructor

```ts
function constructor(options?: { N?: number; r?: number; p?: number; dkLen?: number }): this;
```

- `options`
  - `N` (default: `16384`)
  - `r` (default: `16`)
  - `p` (default: `1`)
  - `dkLen` (default: `64`)

## Methods

- [PasswordHashingAlgorithm.hash](ref:password)
- [PasswordHashingAlgorithm.verify](ref:password)

## Example

```ts
import { Scrypt } from "oslo/password";

const scrypt = new Scrypt();
const hash = await scrypt.hash(password);
const validPassword = await scrypt.verify(hash, password);
```