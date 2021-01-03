import { Hash } from "@vigcoin/crypto";
import { BufferStreamReader, BufferStreamWriter } from "@vigcoin/serializer";
import * as assert from "assert";
import { readFileSync } from "fs";
import * as path from "path";
import { TransactionAmount } from "../src/amount";
import { Transaction } from "../src//index";

export namespace parameters {
  export const CRYPTONOTE_MAX_BLOCK_NUMBER = 500000000;
  export const CRYPTONOTE_MAX_BLOCK_BLOB_SIZE = 500000000;
  export const CRYPTONOTE_MAX_TX_SIZE = 1000000000;
  // TODO Currency-specific address prefix
  export const CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX = 0x3d;

  // TODO: Choose maturity period for your currency
  export const CRYPTONOTE_MINED_MONEY_UNLOCK_WINDOW = 60;
  export const CRYPTONOTE_BLOCK_FUTURE_TIME_LIMIT = 60 * 60 * 2;

  export const BLOCKCHAIN_TIMESTAMP_CHECK_WINDOW = 60;

  // TODO Specify total number of available coins
  // TODO ((uint64_t)(-1)) equals to 18446744073709551616 coins
  // TODO or you can define number explicitly UINT64_C(858986905600000000)
  export const MONEY_SUPPLY = 10000000000000000;

  // Premined percentage
  export const PREMINED_PERCENTAGE = 20;
  export const EMISSION_SPEED_FACTOR = 18;
  assert(EMISSION_SPEED_FACTOR <= 8 * 8, "Bad EMISSION_SPEED_FACTOR");

  // TODO: Define number of blocks for block size median calculation
  export const CRYPTONOTE_REWARD_BLOCKS_WINDOW = 100;
  // Size of block (bytes) after which reward for block calculated using block size
  export const CRYPTONOTE_BLOCK_GRANTED_FULL_REWARD_ZONE = 10000;

  export const CRYPTONOTE_COINBASE_BLOB_RESERVED_SIZE = 600;

  // Difficulty

  // TODO: Define preferred block's target time

  export const DIFFICULTY_TARGET = 120; // seconds
  export const EXPECTED_NUMBER_OF_BLOCKS_PER_DAY =
    (24 * 60 * 60) / DIFFICULTY_TARGET;
  // TODO: There are options to tune CryptoNote's difficulty retargeting function.
  // TODO: We recommend not to change it.
  export const DIFFICULTY_WINDOW = EXPECTED_NUMBER_OF_BLOCKS_PER_DAY; // blocks
  export const DIFFICULTY_CUT = 60; // timestamps to cut after sorting
  export const DIFFICULTY_LAG = 15;

  assert(
    2 * DIFFICULTY_CUT <= DIFFICULTY_WINDOW - 2,
    "Bad DIFFICULTY_WINDOW or DIFFICULTY_CUT"
  );

  export const MAX_BLOCK_SIZE_INITIAL = 20 * 1024;
  export const MAX_BLOCK_SIZE_GROWTH_SPEED_NUMERATOR = 100 * 1024;
  export const MAX_BLOCK_SIZE_GROWTH_SPEED_DENOMINATOR =
    (365 * 24 * 60 * 60) / DIFFICULTY_TARGET;

  // Transaction related

  export const CRYPTONOTE_LOCKED_TX_ALLOWED_DELTA_BLOCKS = 1;
  export const CRYPTONOTE_LOCKED_TX_ALLOWED_DELTA_SECONDS =
    DIFFICULTY_TARGET * CRYPTONOTE_LOCKED_TX_ALLOWED_DELTA_BLOCKS;

  export const CRYPTONOTE_DISPLAY_DECIMAL_POINT = 8;

  export const MINIMUM_FEE = 100;
  export const DEFAULT_DUST_THRESHOLD = MINIMUM_FEE;

  export const FUSION_TX_MAX_SIZE =
    (CRYPTONOTE_BLOCK_GRANTED_FULL_REWARD_ZONE * 30) / 100;
  export const FUSION_TX_MIN_INPUT_COUNT = 12;
  export const FUSION_TX_MIN_IN_OUT_COUNT_RATIO = 4;
}

describe("transaction test", () => {
  it("should read from buffer", () => {
    const buffer = readFileSync(
      path.resolve(__dirname, "./data/transaction-sample-1.dat")
    );
    const hash = Hash.from(buffer);
    const reader = new BufferStreamReader(buffer);
    const transaction = Transaction.read(reader);
    const writer = new BufferStreamWriter(Buffer.alloc(0));
    Transaction.write(writer, transaction);
    const buffer2 = writer.getBuffer();
    assert(buffer.equals(buffer2));

    const hash2 = Hash.from(buffer2);
    assert(hash.equals(hash2));
  });

  it("should read from buffer", () => {
    const buffer = readFileSync(
      path.resolve(__dirname, "./data/transaction-sample-2.dat")
    );
    const hash = Hash.from(buffer);
    const reader = new BufferStreamReader(buffer);
    const transaction = Transaction.read(reader);
    const writer = new BufferStreamWriter(Buffer.alloc(0));
    Transaction.write(writer, transaction);
    const buffer2 = writer.getBuffer();
    assert(buffer.equals(buffer2));
    const hash2 = Hash.from(buffer2);
    assert(hash.equals(hash2));
    const inputs = TransactionAmount.getInputList(transaction);
    const outputs = TransactionAmount.getOutputList(transaction);
    assert(inputs.length > 0);
    assert(outputs.length > 0);
    const outputAmount = TransactionAmount.getOutput(transaction);
    assert(outputAmount > parameters.FUSION_TX_MIN_INPUT_COUNT);
    const inputAmount = TransactionAmount.getInput(transaction);
    assert(inputAmount > parameters.FUSION_TX_MIN_INPUT_COUNT);
    assert(TransactionAmount.check(transaction));
    assert(!TransactionAmount.isFusion(transaction, parameters));
  });

  it("should read from buffer and added by payment 1", () => {
    const buffer = readFileSync(
      path.resolve(__dirname, "./data/transaction-with-nonce.dat")
    );
    const realHash = Buffer.from([
      0x8e,
      0x73,
      0x3a,
      0xc4,
      0x56,
      0x53,
      0xc8,
      0x8d,
      0x4f,
      0x4c,
      0x24,
      0x3e,
      0x75,
      0x26,
      0xc9,
      0xcb,
      0xa0,
      0x8e,
      0x5d,
      0xca,
      0x6f,
      0xf4,
      0x74,
      0x68,
      0x74,
      0x98,
      0xb8,
      0x2e,
      0xae,
      0x8b,
      0x50,
      0x83
    ]);
    const hash = Hash.from(buffer);
    hash.equals(realHash);
    const reader = new BufferStreamReader(buffer);
    const transaction = Transaction.read(reader);
    const writer = new BufferStreamWriter(Buffer.alloc(0));
    Transaction.write(writer, transaction);
    const buffer2 = writer.getBuffer();
    assert(buffer.equals(buffer2));
    const hash2 = Hash.from(buffer2);
    assert(hash.equals(hash2));
  });

  it("should read from buffer and added by payment 2", () => {
    const buffer = readFileSync(
      path.resolve(__dirname, "./data/transaction-with-padding.dat")
    );
    const realHash = Buffer.from([
      0x72,
      0x90,
      0x07,
      0x77,
      0x2b,
      0x65,
      0x5e,
      0xac,
      0x97,
      0x40,
      0xd2,
      0xc4,
      0x1a,
      0x23,
      0xdc,
      0x77,
      0x57,
      0x4d,
      0x76,
      0x42,
      0x08,
      0x68,
      0x03,
      0xfe,
      0x8a,
      0x93,
      0x56,
      0xe7,
      0xca,
      0x20,
      0x58,
      0x2f
    ]);
    const hash = Hash.from(buffer);
    hash.equals(realHash);
    const reader = new BufferStreamReader(buffer);
    const transaction = Transaction.read(reader);
    const writer = new BufferStreamWriter(Buffer.alloc(0));
    Transaction.write(writer, transaction);
    const buffer2 = writer.getBuffer();
    assert(buffer.equals(buffer2));
    const hash2 = Hash.from(buffer2);
    assert(hash.equals(hash2));
  });
});
