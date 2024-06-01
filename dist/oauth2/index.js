"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth2RequestError = exports.generateState = exports.generateCodeVerifier = exports.OAuth2Client = void 0;
const index_js_1 = require("../crypto/index.js");
const index_js_2 = require("../encoding/index.js");
class OAuth2Client {
    constructor(clientId, authorizeEndpoint, tokenEndpoint, options) {
        this.clientId = clientId;
        this.authorizeEndpoint = authorizeEndpoint;
        this.tokenEndpoint = tokenEndpoint;
        this.redirectURI = options?.redirectURI ?? null;
    }
    async createAuthorizationURL(options) {
        const scopes = Array.from(new Set(options?.scopes ?? [])); // remove duplicates
        const authorizationUrl = new URL(this.authorizeEndpoint);
        authorizationUrl.searchParams.set("response_type", "code");
        authorizationUrl.searchParams.set("client_id", this.clientId);
        if (options?.state !== undefined) {
            authorizationUrl.searchParams.set("state", options.state);
        }
        if (scopes.length > 0) {
            authorizationUrl.searchParams.set("scope", scopes.join(" "));
        }
        if (this.redirectURI !== null) {
            authorizationUrl.searchParams.set("redirect_uri", this.redirectURI);
        }
        if (options?.codeVerifier !== undefined) {
            const codeChallengeMethod = options?.codeChallengeMethod ?? "S256";
            if (codeChallengeMethod === "S256") {
                const codeChallengeBuffer = await (0, index_js_1.sha256)(new TextEncoder().encode(options.codeVerifier));
                const codeChallenge = index_js_2.base64url.encode(new Uint8Array(codeChallengeBuffer), {
                    includePadding: false
                });
                authorizationUrl.searchParams.set("code_challenge", codeChallenge);
                authorizationUrl.searchParams.set("code_challenge_method", "S256");
            }
            else if (codeChallengeMethod === "plain") {
                authorizationUrl.searchParams.set("code_challenge", options.codeVerifier);
                authorizationUrl.searchParams.set("code_challenge_method", "plain");
            }
            else {
                throw new TypeError(`Invalid value for 'codeChallengeMethod': ${codeChallengeMethod}`);
            }
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
        if (options?.codeVerifier !== undefined) {
            body.set("code_verifier", options.codeVerifier);
        }
        return await this.sendTokenRequest(body, options);
    }
    async refreshAccessToken(refreshToken, options) {
        const body = new URLSearchParams();
        body.set("refresh_token", refreshToken);
        body.set("client_id", this.clientId);
        body.set("grant_type", "refresh_token");
        const scopes = Array.from(new Set(options?.scopes ?? [])); // remove duplicates
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
        if (options?.credentials !== undefined) {
            const authenticateWith = options?.authenticateWith ?? "http_basic_auth";
            if (authenticateWith === "http_basic_auth") {
                const encodedCredentials = index_js_2.base64.encode(new TextEncoder().encode(`${this.clientId}:${options.credentials}`));
                headers.set("Authorization", `Basic ${encodedCredentials}`);
            }
            else if (authenticateWith === "request_body") {
                body.set("client_secret", options.credentials);
            }
            else {
                throw new TypeError(`Invalid value for 'authenticateWith': ${authenticateWith}`);
            }
        }
        const request = new Request(this.tokenEndpoint, {
            method: "POST",
            headers,
            body
        });
        const response = await fetch(request);
        const result = await response.json();
        // providers are allowed to return non-400 status code for errors
        if (!("access_token" in result) && "error" in result) {
            throw new OAuth2RequestError(request, result);
        }
        else if (!response.ok) {
            throw new OAuth2RequestError(request, {});
        }
        return result;
    }
}
exports.OAuth2Client = OAuth2Client;
function generateCodeVerifier() {
    const randomValues = new Uint8Array(32);
    crypto.getRandomValues(randomValues);
    return index_js_2.base64url.encode(randomValues, {
        includePadding: false
    });
}
exports.generateCodeVerifier = generateCodeVerifier;
function generateState() {
    const randomValues = new Uint8Array(32);
    crypto.getRandomValues(randomValues);
    return index_js_2.base64url.encode(randomValues, {
        includePadding: false
    });
}
exports.generateState = generateState;
class OAuth2RequestError extends Error {
    constructor(request, body) {
        super(body.error ?? "");
        this.request = request;
        this.description = body.error_description ?? null;
    }
}
exports.OAuth2RequestError = OAuth2RequestError;