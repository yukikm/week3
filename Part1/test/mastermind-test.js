//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

const { buildPoseidon } = require('circomlibjs');


describe("MastermindVariation test", function () {
    this.timeout(100000000);

    it("MastermindVariation test", async () => {
        const current = process.cwd()
        const circuit = await wasm_tester(current + "/contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        const poseidon = await buildPoseidon();

        const testCase = {
            "guess": [4, 3, 2, 1],
            "soln":  [4, 3, 2, 1],
            "whitePegs": 0,
            "blackPegs": 4,
        }

        const privSalt = 1234;
        testCase.soln.push(privSalt);

        const poseidonHash = poseidon(testCase.soln);
        const hash = poseidon.F.toObject(poseidonHash);
        const INPUT = {
            pubNumBlacks: testCase.blackPegs.toString(),
            pubNumWhites: testCase.whitePegs.toString(),
            pubSolnHash: hash,
            privSalt: privSalt,
            pubGuessA: testCase.guess[0],
            pubGuessB: testCase.guess[1],
            pubGuessC: testCase.guess[2],
            pubGuessD: testCase.guess[3],
            privSolnA: testCase.soln[0],
            privSolnB: testCase.soln[1],
            privSolnC: testCase.soln[2],
            privSolnD: testCase.soln[3],
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[3]),Fr.e(3)));
    });
});