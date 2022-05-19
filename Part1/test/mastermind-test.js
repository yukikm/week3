//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const chai = require("chai");

const wasm_tester = require("circom_tester").wasm;

const {bigInt} = require("snarkjs");
const crypto = require("crypto");

const { buildPoseidon } = require('circomlibjs');

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("System of equations test", function () {
    this.timeout(100000000);

    it("Bonus question", async () => {
        const circuit = await wasm_tester("../contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();


        const poseidon = await buildPoseidon();
        const poseidonHash = poseidon([1,2,3,4]);
        const hash = poseidon.F.toObject(poseidonHash);

        const INPUT = {
            pubNumBlack: 0,
            pubNumWhite: 1,

            pubSolnHash: poseidonHash.encodedHash,
            privSalt: hash.toString(),

            pubGuessA: 1,
            pubGuessB: 1,
            pubGuessC: 1,
            pubGuessD: 1,
            privSolnA: 1,
            privSolnB: 1,
            privSolnC: 1,
            privSolnD: 1,
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(1)));
    });
});