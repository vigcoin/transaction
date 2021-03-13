// import { Key, Wallet } from '@vigcoin/crypto';
import { BufferStreamReader, BufferStreamWriter } from '@vigcoin/serializer';
import {
  ETransactionIOType,
  ITransactionInput,
  // ETransactionIOType,
  IInputBase,
  // IInputKey,
  // ITransactionInput,
  ITransactionPrefix,
  IInputSignature,
  ITransactionOutput,
  IOutputSignature,
} from '@vigcoin/types';
import { TransactionPrefix } from '../src/index';

test('Should have create prefix', () => {
  const prefix: ITransactionPrefix = {
    extra: Buffer.alloc(0),
    inputs: [],
    outputs: [],
    unlockTime: new Date().getTime(),
    version: 1,
  };

  const buffer = TransactionPrefix.toBuffer(prefix);
  expect(buffer.length > 0).toBeTruthy();

  const hash = TransactionPrefix.hash(prefix);
  expect(hash.length > 0).toBeTruthy();
});

test('Should read / write input base', () => {
  const input1: ITransactionInput = {
    tag: ETransactionIOType.BASE,
    target: {
      blockIndex: 1,
    },
  };

  const writer = new BufferStreamWriter();

  TransactionPrefix.writeInput(writer, input1);
  const buffer = writer.getBuffer();

  const reader = new BufferStreamReader(buffer);

  const input11: ITransactionInput = TransactionPrefix.readInput(reader);

  expect(input11.tag === input1.tag).toBeTruthy();
  expect(
    (input11.target as IInputBase).blockIndex ===
      (input1.target as IInputBase).blockIndex
  ).toBeTruthy();
});

test('Should read / write input signature', () => {
  const input1: ITransactionInput = {
    tag: ETransactionIOType.SIGNATURE,
    target: {
      amount: 1000019220,
      count: 0,
      outputIndex: 0,
    },
  };

  const writer = new BufferStreamWriter();

  TransactionPrefix.writeInput(writer, input1);
  const buffer = writer.getBuffer();

  const reader = new BufferStreamReader(buffer);

  const input11: ITransactionInput = TransactionPrefix.readInput(reader);

  expect(input11.tag === input1.tag).toBeTruthy();
  expect(
    (input11.target as IInputSignature).amount ===
      (input1.target as IInputSignature).amount
  ).toBeTruthy();

  expect(
    (input11.target as IInputSignature).count ===
      (input1.target as IInputSignature).count
  ).toBeTruthy();

  expect(
    (input11.target as IInputSignature).outputIndex ===
      (input1.target as IInputSignature).outputIndex
  ).toBeTruthy();
});

test('Should read / write output signature', () => {
  const output1: ITransactionOutput = {
    tag: ETransactionIOType.SIGNATURE,
    amount: 1,
    target: {
      count: 1,
      keys: [Buffer.allocUnsafe(32)],
    },
  };

  const writer = new BufferStreamWriter();

  TransactionPrefix.writeOutput(writer, output1);
  const buffer = writer.getBuffer();

  const reader = new BufferStreamReader(buffer);

  const output11: ITransactionOutput = TransactionPrefix.readOutput(reader);

  expect(output1.tag === output11.tag).toBeTruthy();
  expect(output1.amount === output11.amount).toBeTruthy();

  expect(
    (output1.target as IOutputSignature).count ===
      (output11.target as IOutputSignature).count
  ).toBeTruthy();

  expect(
    (output1.target as IOutputSignature).keys.length ===
      (output11.target as IOutputSignature).keys.length
  ).toBeTruthy();
  const keys1 = (output1.target as IOutputSignature).keys;
  const keys11 = (output11.target as IOutputSignature).keys;
  for (let i = 0; i < (output1.target as IOutputSignature).keys.length; i++) {
    expect(keys1[i].equals(keys11[i])).toBeTruthy();
  }
});

test('Should throw exception on wrong tag id in output', () => {
  const input1: ITransactionInput = {
    tag: 0xaa,
    target: {
      amount: 1000019220,
      count: 0,
      outputIndex: 0,
    },
  };
  let catched = false;
  const writer = new BufferStreamWriter();
  try {
    TransactionPrefix.writeInput(writer, input1);
  } catch (e) {
    catched = true;
  }
  expect(catched).toBeTruthy();
  writer.writeUInt8(0xaa);

  catched = false;

  const buffer = writer.getBuffer();

  const reader = new BufferStreamReader(buffer);

  try {
    TransactionPrefix.readInput(reader);
  } catch (e) {
    catched = true;
  }

  expect(catched).toBeTruthy();
});

test('Should throw exception on wrong tag id in output', () => {
  const input1: ITransactionOutput = {
    tag: 0xaa,
    amount: 1000019220,
    target: {
      count: 0,
      keys: [],
    },
  };
  let catched = false;
  const writer = new BufferStreamWriter();
  try {
    TransactionPrefix.writeOutput(writer, input1);
  } catch (e) {
    catched = true;
  }
  expect(catched).toBeTruthy();
  writer.writeUInt8(0xaa);

  catched = false;

  const buffer = writer.getBuffer();

  const reader = new BufferStreamReader(buffer);

  try {
    TransactionPrefix.readOutput(reader);
  } catch (e) {
    catched = true;
  }

  expect(catched).toBeTruthy();
});
