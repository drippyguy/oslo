"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTOTPKeyURI = exports.createHOTPKeyURI = exports.TOTPController = exports.generateHOTP = void 0;
var hotp_js_1 = require("./hotp.js");
Object.defineProperty(exports, "generateHOTP", { enumerable: true, get: function () { return hotp_js_1.generateHOTP; } });
var totp_js_1 = require("./totp.js");
Object.defineProperty(exports, "TOTPController", { enumerable: true, get: function () { return totp_js_1.TOTPController; } });
var uri_js_1 = require("./uri.js");
Object.defineProperty(exports, "createHOTPKeyURI", { enumerable: true, get: function () { return uri_js_1.createHOTPKeyURI; } });
Object.defineProperty(exports, "createTOTPKeyURI", { enumerable: true, get: function () { return uri_js_1.createTOTPKeyURI; } });
