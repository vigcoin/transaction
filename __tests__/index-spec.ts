import * as index from "../src/index";

test("Should have Greeter available", () => {
  expect(index.TransactionPrefix).toBeTruthy();
  expect(index.TransactionDetails).toBeTruthy();
  expect(index.TransactionAmount).toBeTruthy();
  expect(index.Transaction).toBeTruthy();
});
