"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuthnController = void 0;
const index_js_1 = require("../encoding/index.js");
const bytes_js_1 = require("../bytes.js");
const index_js_2 = require("../crypto/index.js");
class WebAuthnController {
    constructor(origin) {
        this.originURL = new URL(origin);
    }
    async validateAttestationResponse(response, challenge) {
        const validClientDataJSON = this.verifyClientDataJSON("webauthn.create", response.clientDataJSON, challenge);
        if (!validClientDataJSON) {
            throw new Error("Failed to validate client data JSON");
        }
        const validAuthenticatorData = await this.verifyAuthenticatorData(response.authenticatorData);
        if (!validAuthenticatorData) {
            throw new Error("Failed to validate authenticator data");
        }
    }
    async validateAssertionResponse(algorithm, publicKey, response, challenge) {
        const validClientDataJSON = this.verifyClientDataJSON("webauthn.get", response.clientDataJSON, challenge);
        if (!validClientDataJSON) {
            throw new Error("Failed to validate client data JSON");
        }
        const validAuthenticatorData = await this.verifyAuthenticatorData(response.authenticatorData);
        if (!validAuthenticatorData) {
            throw new Error("Failed to validate authenticator data");
        }
        if (algorithm === "ES256") {
            const signature = convertDERSignatureToECDSASignature(response.signature);
            const hash = await crypto.subtle.digest("SHA-256", response.clientDataJSON);
            const data = concatenateBuffer(response.authenticatorData, hash);
            const es256 = new index_js_2.ECDSA("SHA-256", "P-256");
            const validSignature = await es256.verify(publicKey, signature, data);
            if (!validSignature) {
                throw new Error("Failed to validate signature");
            }
        }
        else if (algorithm === "RS256") {
            const signature = convertDERSignatureToECDSASignature(response.signature);
            const hash = await crypto.subtle.digest("SHA-256", response.clientDataJSON);
            const data = concatenateBuffer(response.authenticatorData, hash);
            const rs256 = new index_js_2.RSASSAPKCS1v1_5("SHA-256");
            const validSignature = await rs256.verify(publicKey, signature, data);
            if (!validSignature) {
                throw new Error("Failed to validate signature");
            }
        }
        else {
            throw new TypeError(`Unknown algorithm: ${algorithm}`);
        }
    }
    verifyClientDataJSON(type, clientDataJSON, challenge) {
        const clientData = JSON.parse(new TextDecoder().decode(clientDataJSON));
        if (!clientData || typeof clientData !== "object") {
            return false;
        }
        if (!("type" in clientData) || clientData.type !== type) {
            return false;
        }
        if (!("challenge" in clientData) || typeof clientData.challenge !== "string") {
            return false;
        }
        const clientDataChallengeBuffer = index_js_1.base64url.decode(clientData.challenge, {
            strict: false
        });
        if (!(0, bytes_js_1.compareBytes)(clientDataChallengeBuffer, challenge)) {
            return false;
        }
        if (!("origin" in clientData) || clientData.origin !== this.originURL.origin) {
            return false;
        }
        return true;
    }
    async verifyAuthenticatorData(authenticatorData) {
        const authData = new Uint8Array(authenticatorData);
        if (authData.byteLength < 37) {
            return false;
        }
        const rpIdHash = authData.slice(0, 32);
        const rpIdData = new TextEncoder().encode(this.originURL.hostname);
        const expectedRpIdHash = await crypto.subtle.digest("SHA-256", rpIdData);
        // compare buffer
        if (!(0, bytes_js_1.compareBytes)(rpIdHash, expectedRpIdHash)) {
            return false;
        }
        const flagsBits = authData[32].toString(2);
        if (flagsBits.charAt(flagsBits.length - 1) !== "1") {
            return false;
        }
        return true;
    }
}
exports.WebAuthnController = WebAuthnController;
function convertDERSignatureToECDSASignature(DERSignature) {
    const signatureBytes = new Uint8Array(DERSignature);
    const rStart = 4;
    const rLength = signatureBytes[3];
    const rEnd = rStart + rLength;
    const DEREncodedR = signatureBytes.slice(rStart, rEnd);
    // DER encoded 32 bytes integers can have leading 0x00s or be smaller than 32 bytes
    const r = decodeDERInteger(DEREncodedR, 32);
    const sStart = rEnd + 2;
    const sEnd = signatureBytes.byteLength;
    const DEREncodedS = signatureBytes.slice(sStart, sEnd);
    // repeat the process
    const s = decodeDERInteger(DEREncodedS, 32);
    const ECDSASignature = new Uint8Array([...r, ...s]);
    return ECDSASignature.buffer;
}
function decodeDERInteger(integerBytes, expectedLength) {
    if (integerBytes.byteLength === expectedLength)
        return integerBytes;
    if (integerBytes.byteLength < expectedLength) {
        return concatenateUint8Array(
        // add leading 0x00s if smaller than expected length
        new Uint8Array(expectedLength - integerBytes.byteLength).fill(0), integerBytes);
    }
    // remove leading 0x00s if larger then expected length
    return integerBytes.slice(-32);
}
function concatenateBuffer(buffer1, buffer2) {
    return concatenateUint8Array(new Uint8Array(buffer1), new Uint8Array(buffer2)).buffer;
}
function concatenateUint8Array(bytes1, bytes2) {
    const result = new Uint8Array(bytes1.byteLength + bytes2.byteLength);
    result.set(new Uint8Array(bytes1), 0);
    result.set(new Uint8Array(bytes2), bytes1.byteLength);
    return result;
}