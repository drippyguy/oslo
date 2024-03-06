import { expect } from "vitest";
import { test } from "vitest";
import { generateHOTP } from "./hotp.js";
test("generateHOTP()", async () => {
  const secret = new Uint8Array([
    99,
    7,
    135,
    6,
    228,
    137,
    27,
    7,
    133,
    186,
    66,
    189,
    35,
    172,
    221,
    9,
    228,
    105,
    51,
    99,
    190,
    250,
    37,
    164,
    19,
    70,
    238,
    11,
    218,
    176,
    114,
    76,
    160,
    143,
    141,
    38,
    99,
    14,
    181,
    108,
    163,
    253,
    206,
    108,
    192,
    14,
    248,
    101,
    109,
    31,
    235,
    199,
    53,
    146,
    135,
    22,
    61,
    17,
    52,
    32,
    0,
    122,
    24,
    28
  ]);
  expect(generateHOTP(secret, 0)).resolves.toBe("173573");
  expect(generateHOTP(secret, 10)).resolves.toBe("110880");
  expect(generateHOTP(secret, 100)).resolves.toBe("020803");
  expect(generateHOTP(secret, 1e3)).resolves.toBe("115716");
});
//# sourceMappingURL=hotp.test.js.map