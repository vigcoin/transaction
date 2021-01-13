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
