import { Key } from '@vigcoin/crypto';
import {
  ITransactionExtra,
  ITransactionExtraTag,
  TX_EXTRA_NONCE_MAX_COUNT,
  TX_EXTRA_PADDING_MAX_COUNT,
} from '@vigcoin/types';
import { TransactionExtra } from '../src/index';

test('Should have create extra successfuly', () => {
  const extra1: ITransactionExtra = {
    tag: ITransactionExtraTag.NONCE,
    data: {
      nonce: Buffer.allocUnsafe(32),
    },
  };

  const extraClass = new TransactionExtra();
  extraClass.add(extra1);
  const buffer1 = extraClass.toBuffer();

  expect(buffer1.length === 34).toBeTruthy();

  const extra11 = TransactionExtra.read(buffer1);
  expect(extra11.length === 1).toBeTruthy();
  expect(extra11[0].tag === ITransactionExtraTag.NONCE).toBeTruthy();

  const extra2: ITransactionExtra = {
    tag: ITransactionExtraTag.PADDING,
    data: {
      size: 10,
    },
  };
  extraClass.add(extra2);

  const buffer2 = extraClass.toBuffer();

  expect(buffer2.length === 44).toBeTruthy();
  const extra12 = TransactionExtra.read(buffer2);
  expect(extra12.length === 2).toBeTruthy();
  expect(extra12[1].tag === ITransactionExtraTag.PADDING).toBeTruthy();

  const txKeys = Key.generateKeys();

  const extra3: ITransactionExtra = {
    tag: ITransactionExtraTag.PUBKEY,
    data: {
      key: txKeys.public,
    },
  };

  extraClass.add(extra3);

  const buffer3 = extraClass.toBuffer();
  expect(buffer3.length === 77).toBeTruthy();

  const extra13 = TransactionExtra.read(buffer3);
  expect(extra13.length === 3).toBeTruthy();
  expect(extra13[2].tag === ITransactionExtraTag.PUBKEY).toBeTruthy();
});

test('Should throw error due to wrong tag value', () => {
  const extra1: ITransactionExtra = {
    tag: 11,
    data: {
      nonce: Buffer.allocUnsafe(32),
    },
  };

  const extraClass = new TransactionExtra();
  extraClass.add(extra1);

  let catched = false;
  try {
    extraClass.toBuffer();
  } catch (e) {
    catched = true;
  }

  expect(catched).toBeTruthy();
});

test('Should throw error due to wrong tag value', () => {
  const buffer = Buffer.alloc(30, 11);

  let catched = false;
  try {
    TransactionExtra.read(buffer);
  } catch (e) {
    catched = true;
  }

  expect(catched).toBeTruthy();
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

test('Should fail due to wrong nonce length', () => {
  const extra1: ITransactionExtra = {
    tag: ITransactionExtraTag.NONCE,
    data: {
      nonce: Buffer.alloc(0),
    },
  };

  const extraClass = new TransactionExtra();
  extraClass.add(extra1);

  const buffer = extraClass.toBuffer();
  TransactionExtra.read(buffer);
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
  expect(buffer.length === 0).toBeTruthy();
});
