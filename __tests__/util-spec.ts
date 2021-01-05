import { decompose, isTxUnlock } from "../src/util";
import { parameters } from "./__util__/parameters";

test("Should have decompose numbers", () => {
  let docomposed = decompose(1000, 100);
  expect(JSON.stringify([1000, 0]) === JSON.stringify(docomposed)).toBeTruthy();
  docomposed = decompose(0, 100);
  expect(JSON.stringify([]) === JSON.stringify(docomposed)).toBeTruthy();
});

test("Should determine tx unlocked", () => {
  let isLocked = isTxUnlock(100000000, 1, parameters);

  expect(!isLocked).toBeTruthy();
  isLocked = isTxUnlock(100000000, 1000000001, parameters);
  expect(isLocked).toBeTruthy();

  isLocked = isTxUnlock(500000002, 100, parameters);
  expect(isLocked).toBeTruthy();
  isLocked = isTxUnlock(500000002, 100, parameters);
  expect(isLocked).toBeTruthy();
  isLocked = isTxUnlock(5500000002, 100, parameters);
  expect(!isLocked).toBeTruthy();

});
