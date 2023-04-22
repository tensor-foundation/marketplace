"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunks = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
function chunks(arr, size) {
    return arr.reduce((acc, val, ind) => {
        const subIndex = ind % size;
        if (!Array.isArray(acc[subIndex])) {
            acc[subIndex] = [val];
        }
        else {
            acc[subIndex].push(val);
        }
        return acc;
    }, []);
}
exports.chunks = chunks;
