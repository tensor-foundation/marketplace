"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.amman = void 0;
const amman_client_1 = require("@metaplex-foundation/amman-client");
const errors_1 = require("../utils/errors");
const generated_1 = require("../../src/generated");
const _1 = require(".");
exports.amman = amman_client_1.Amman.instance({
    knownLabels: { [generated_1.PROGRAM_ADDRESS]: 'Token Metadata Program' },
    log: _1.logDebug,
    errorResolver: errors_1.cusper,
});
