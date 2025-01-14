import { hash, verify } from "@node-rs/argon2";
const v0x13 = 1;
class Argon2id {
  constructor(options) {
    this.memorySize = options?.memorySize ?? 19456;
    this.iterations = options?.iterations ?? 2;
    this.tagLength = options?.tagLength ?? 32;
    this.parallelism = options?.parallelism ?? 1;
    this.secret = options?.secret ?? null;
  }
  memorySize;
  iterations;
  tagLength;
  parallelism;
  secret;
  async hash(password) {
    return await hash(password.normalize("NFKC"), {
      memoryCost: this.memorySize,
      timeCost: this.iterations,
      outputLen: this.tagLength,
      parallelism: this.parallelism,
      version: v0x13,
      secret: this.secret ? Buffer.from(this.secret) : void 0
    });
  }
  async verify(hash2, password) {
    return await verify(hash2, password.normalize("NFKC"), {
      memoryCost: this.memorySize,
      timeCost: this.iterations,
      outputLen: this.tagLength,
      parallelism: this.parallelism,
      version: v0x13,
      secret: this.secret ? Buffer.from(this.secret) : void 0
    });
  }
}
export {
  Argon2id
};
//# sourceMappingURL=argon2id.js.map