// import { Key, Wallet } from '@vigcoin/crypto';
import {
  // ETransactionIOType,
  // IInputBase,
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

  // const inputBase: IInputBase = {
  //   blockIndex: 1,
  // };

  // const sender = new Wallet();
  // // CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX
  // const addressPrefix = 0x3d;
  // sender.create(addressPrefix);
  // const keys = sender.getPrivateKeys();
  // const publicKeys = Key.secretToPublic(Buffer.from(keys.spend, 'hex'));
  // const viewPublicKeys = Key.secretToPublic(Buffer.from(keys.view, 'hex'));
  // const sendAddress = sender.toAddress(0x3d);

  // const extraKey = Key.generateKeys();
  // const inputKey: IInputKey = {};

  // const input: ITransactionInput = {
  //   tag: ETransactionIOType.BASE
  // };
});
