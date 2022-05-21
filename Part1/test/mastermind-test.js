//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const chai = require("chai");
const path = require("path");

const snarkjs = require("snarkjs");
const crypto = require("crypto");


const wasm_tester = require("circom_tester").wasm;


const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

const { buildPoseidon } = require('circomlibjs');


describe("System of equations test", function () {
    this.timeout(100000000);

    it("Bonus question", async () => {
        const circuit = await wasm_tester("/Users/kimurayuki/blockchain/zkuniversity/week3_2/Part1/contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        const poseidon = await buildPoseidon();

        

        const testCase = {
            "guess": [4, 3, 2, 1],
            "soln":  [4, 3, 2, 1],
            "whitePegs": 0,
            "blackPegs": 4,
        }

        const soln = genSolnInput(testCase.soln)
        const saltedSoln = soln.add(genSalt())
        console.log(saltedSoln.toString())

        const poseidonHash = poseidon(testCase.soln);
        const hash = poseidon.F.toObject(poseidonHash);
        console.log(poseidonHash)
        const INPUT = {
            pubNumBlacks: testCase.blackPegs.toString(),
            pubNumWhites: testCase.whitePegs.toString(),

            pubSolnHash: hash,
            privSalt: saltedSoln.toString(),

            pubGuessA: testCase.guess[0],
            pubGuessB: testCase.guess[1],
            pubGuessC: testCase.guess[2],
            pubGuessD: testCase.guess[3],
            privSolnA: testCase.soln[0],
            privSolnB: testCase.soln[1],
            privSolnC: testCase.soln[2],
            privSolnD: testCase.soln[3],
        }

        const witness = await circuit.calculateWitness(INPUT);

        console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(1)));
    });
});

const genSolnInput = (soln) => {
    let m = bigInt(0)

    for (let i=soln.length-1; i >= 0; i--) {
        m = m.add(bigInt(soln[i] * (4 ** i)))
    }

    return m
}

const genSalt = () => {
    // the maximum integer supported by Solidity is (2 ^ 256), which is 32
    // bytes long
    const buf = crypto.randomBytes(30)
    const salt = bigInt.leBuff2int(buf).sub(bigInt(340))

    // 4 * (4^3) + 4 * (4^2) + 4 * (4^1) + 4 * (4^0) = 340
    // Only return values greater than the largest possible solution
    if (salt.lt(340)) {
        return genSalt()
    }

    return salt
}