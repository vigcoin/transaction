import { ITransactionPrefix } from '@vigcoin/types';
import { TransactionPrefix } from '../src/index';

test('Should have create prefix', () => {
  const prefix: ITransactionPrefix = {
    version: 1,
    unlockTime: new Date().getTime(),
    inputs: [],
    outputs: [],
    extra: Buffer.alloc(0),
  };

  const buffer = TransactionPrefix.toBuffer(prefix);
  expect(buffer.length > 0).toBeTruthy();
});
