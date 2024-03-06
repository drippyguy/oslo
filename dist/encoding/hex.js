const hexAlphabet = "0123456789abcdef";
const hexDecodeMap = /* @__PURE__ */ new Map([
  ["0", 0],
  ["1", 1],
  ["2", 2],
  ["3", 3],
  ["4", 4],
  ["5", 5],
  ["6", 6],
  ["7", 7],
  ["8", 8],
  ["9", 9],
  ["A", 10],
  ["B", 11],
  ["C", 12],
  ["D", 13],
  ["E", 14],
  ["F", 15],
  ["a", 10],
  ["b", 11],
  ["c", 12],
  ["d", 13],
  ["e", 14],
  ["f", 15]
]);
function encodeHex(data) {
  const bytes = new Uint8Array(data);
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    const key1 = bytes[i] >> 4;
    result += hexAlphabet[key1];
    const key2 = bytes[i] & 15;
    result += hexAlphabet[key2];
  }
  return result;
}
function decodeHex(data) {
  const chunkCount = Math.ceil(data.length / 2);
  const result = new Uint8Array(chunkCount);
  for (let i = 0; i < chunkCount; i++) {
    let buffer = 0;
    const encoded1 = data[i * 2];
    const value1 = hexDecodeMap.get(encoded1) ?? null;
    if (value1 === null) {
      throw new Error(`Invalid character: ${encoded1}`);
    }
    buffer += value1 << 4;
    const encoded2 = data[i * 2 + 1];
    if (encoded2 === void 0) {
      throw new Error("Invalid data");
    }
    const value2 = hexDecodeMap.get(encoded2) ?? null;
    if (value2 === null) {
      throw new Error(`Invalid character: ${encoded1}`);
    }
    buffer += value2;
    result[i] = buffer;
  }
  return result;
}
export {
  decodeHex,
  encodeHex
};
//# sourceMappingURL=hex.js.map