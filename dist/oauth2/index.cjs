"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var oauth2_exports = {};
__export(oauth2_exports, {
  OAuth2Client: () => OAuth2Client,
  OAuth2RequestError: () => OAuth2RequestError,
  generateCodeVerifier: () => generateCodeVerifier,
  generateState: () => generateState
});
module.exports = __toCommonJS(oauth2_exports);
var import_crypto = require("../crypto/index.cjs");
var import_encoding = require("../encoding/index.cjs");
class OAuth2Client {
  clientId;
  authorizeEndpoint;
  tokenEndpoint;
  redirectURI;
  constructor(clientId, authorizeEndpoint, tokenEndpoint, options) {
    this.clientId = clientId;
    this.authorizeEndpoint = authorizeEndpoint;
    this.tokenEndpoint = tokenEndpoint;
    this.redirectURI = options?.redirectURI ?? null;
  }
  async createAuthorizationURL(options) {
    const scopes = Array.from(new Set(options?.scopes ?? []));
    const authorizationUrl = new URL(this.authorizeEndpoint);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", this.clientId);
    if (options?.state !== void 0) {
      authorizationUrl.searchParams.set("state", options.state);
    }
    if (scopes.length > 0) {
      authorizationUrl.searchParams.set("scope", scopes.join(" "));
    }
    if (this.redirectURI !== null) {
      authorizationUrl.searchParams.set("redirect_uri", this.redirectURI);
    }
    if (options?.codeVerifier !== void 0) {
      const codeChallengeBuffer = await (0, import_crypto.sha256)(new TextEncoder().encode(options.codeVerifier));
      const codeChallenge = import_encoding.base64url.encode(new Uint8Array(codeChallengeBuffer), {
        includePadding: false
      });
      authorizationUrl.searchParams.set("code_challenge_method", "S256");
      authorizationUrl.searchParams.set("code_challenge", codeChallenge);
    }
    return authorizationUrl;
  }
  async validateAuthorizationCode(authorizationCode, options) {
    const body = new URLSearchParams();
    body.set("code", authorizationCode);
    body.set("client_id", this.clientId);
    body.set("grant_type", "authorization_code");
    if (this.redirectURI !== null) {
      body.set("redirect_uri", this.redirectURI);
    }
    if (options?.codeVerifier !== void 0) {
      body.set("code_verifier", options.codeVerifier);
    }
    return await this.sendTokenRequest(body, options);
  }
  async refreshAccessToken(refreshToken, options) {
    const body = new URLSearchParams();
    body.set("refresh_token", refreshToken);
    body.set("client_id", this.clientId);
    body.set("grant_type", "refresh_token");
    const scopes = Array.from(new Set(options?.scopes ?? []));
    if (scopes.length > 0) {
      body.set("scope", scopes.join(" "));
    }
    return await this.sendTokenRequest(body, options);
  }
  async sendTokenRequest(body, options) {
    const headers = new Headers();
    headers.set("Content-Type", "application/x-www-form-urlencoded");
    headers.set("Accept", "application/json");
    headers.set("User-Agent", "oslo");
    if (options?.credentials !== void 0) {
      const authenticateWith = options?.authenticateWith ?? "http_basic_auth";
      if (authenticateWith === "http_basic_auth") {
        const encodedCredentials = import_encoding.base64.encode(
          new TextEncoder().encode(`${this.clientId}:${options.credentials}`)
        );
        headers.set("Authorization", `Basic ${encodedCredentials}`);
      } else {
        body.set("client_secret", options.credentials);
      }
    }
    const request = new Request(this.tokenEndpoint, {
      method: "POST",
      headers,
      body
    });
    const response = await fetch(request);
    const result = await response.json();
    if (!("access_token" in result) && "error" in result) {
      throw new OAuth2RequestError(request, result);
    } else if (!response.ok) {
      throw new OAuth2RequestError(request, {});
    }
    return result;
  }
}
function generateCodeVerifier() {
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);
  return import_encoding.base64url.encode(randomValues, {
    includePadding: false
  });
}
function generateState() {
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);
  return import_encoding.base64url.encode(randomValues, {
    includePadding: false
  });
}
class OAuth2RequestError extends Error {
  request;
  description;
  constructor(request, body) {
    super(body.error ?? "");
    this.request = request;
    this.description = body.error_description ?? null;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OAuth2Client,
  OAuth2RequestError,
  generateCodeVerifier,
  generateState
});
//# sourceMappingURL=index.cjs.map