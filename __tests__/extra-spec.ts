import { Key } from '@vigcoin/crypto';
// import { assert } from 'console';
import {
  ITransactionExtra,
  ITransactionExtraTag,
  TransactionExtra,
  TX_EXTRA_NONCE_MAX_COUNT,
  TX_EXTRA_PADDING_MAX_COUNT,
} from '../src/index';

test('Should have create extra successfuly', () => {
  const extra1: ITransactionExtra = {
    tag: ITransactionExtraTag.NONCE,
    data: {
      nonce: Buffer.allocUnsafe(32),
    },
  };

  const extra2: ITransactionExtra = {
    tag: ITransactionExtraTag.PADDING,
    data: {
      size: 10,
    },
  };

  const txKeys = Key.generateKeys();

  const extra3: ITransactionExtra = {
    tag: ITransactionExtraTag.PUBKEY,
    data: {
      key: txKeys.public,
    },
  };

  const extraClass = new TransactionExtra();
  extraClass.add(extra1);
  extraClass.add(extra2);
  extraClass.add(extra3);

  const buffer = extraClass.toBuffer();
  expect(buffer.length > 0).toBeTruthy();

  // const extra4 = TransactionExtra.read(buffer);
  // console.log(extra4);
  // expect(extra4.length === 3).toBeTruthy();
});

test('Should fail due to wrong nonce length', () => {
  const extra1: ITransactionExtra = {
    tag: ITransactionExtraTag.NONCE,
    data: {
      nonce: Buffer.allocUnsafe(TX_EXTRA_NONCE_MAX_COUNT + 1),
    },
  };

  const extraClass = new TransactionExtra();
  extraClass.add(extra1);

  const buffer = extraClass.toBuffer();
  expect(buffer.length === 0).toBeTruthy();
});

test('Should fail due to wrong padding size', () => {
  const extra1: ITransactionExtra = {
    tag: ITransactionExtraTag.PADDING,
    data: {
      size: TX_EXTRA_PADDING_MAX_COUNT + 1,
    },
  };

  const extraClass = new TransactionExtra();
  extraClass.add(extra1);

  const buffer = extraClass.toBuffer();
  console.log(buffer);
  expect(buffer.length === 0).toBeTruthy();
});
