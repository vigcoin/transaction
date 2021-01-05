import * as index from '../src/index';

test('Should have the followings available', () => {
  expect(index.TransactionPrefix).toBeTruthy();
  expect(index.TransactionDetails).toBeTruthy();
  expect(index.TransactionAmount).toBeTruthy();
  expect(index.Transaction).toBeTruthy();
});
