import { CNFashHash, Key } from '@vigcoin/crypto';
import { BufferStreamReader, BufferStreamWriter } from '@vigcoin/serializer';
import {
  ETransactionIOType,
  IHash,
  IPrivateKey,
  ISignature,
  ITransaction,
  ITransactionEntry,
  ITransactionExtraPublicKey,
  ITransactionExtraTag,
  ITransactionInput,
  ITransactionPrefix,
  uint8,
  usize,
} from '@vigcoin/types';
import assert = require('assert');
import { TransactionExtra } from './extra';

import { TransactionPrefix } from './prefix';

// tslint:disable-next-line: max-classes-per-file
export class Transaction {
  public static readSubSignature(reader: BufferStreamReader): ISignature {
    return reader.read(64);
  }

  public static writeSubSignature(
    writer: BufferStreamWriter,
    signature: ISignature
  ) {
    writer.write(signature);
  }
  public static readSignatureCount(input: ITransactionInput) {
    switch (input.tag) {
      case ETransactionIOType.BASE:
        return 0;
      case ETransactionIOType.KEY:
        const key: any = input.target;
        return key.outputIndexes.length;
      case ETransactionIOType.SIGNATURE:
        const signature: any = input.target;
        return signature.count;
    }
  }

  public static readSignatures(
    reader: BufferStreamReader,
    prefix: ITransactionPrefix
  ) {
    const size = prefix.inputs.length;
    const signatures = [];
    for (let i = 0; i < size; i++) {
      const count = Transaction.readSignatureCount(prefix.inputs[i]);

      const subSig: ISignature[] = [];
      for (let j = 0; j < count; j++) {
        subSig.push(Transaction.readSubSignature(reader));
      }
      signatures[i] = subSig;
    }
    return signatures;
  }

  public static writeSignatures(
    writer: BufferStreamWriter,
    // prefix: ITransactionPrefix,
    signatures: any[][]
  ) {
    const size = signatures.length;
    for (let i = 0; i < size; i++) {
      for (const signature of signatures[i]) {
        Transaction.writeSubSignature(writer, signature);
      }
    }
    return signatures;
  }

  public static read(reader: BufferStreamReader): ITransaction {
    const prefix = TransactionPrefix.read(reader);
    return {
      prefix,
      signatures: Transaction.readSignatures(reader, prefix),
    };
  }

  public static readEntry(reader: BufferStreamReader): ITransactionEntry {
    const tx = Transaction.read(reader);
    const size = reader.readVarint();

    const globalOutputIndexes = [];

    for (let i = 0; i < size; i++) {
      const index = reader.readVarint();
      globalOutputIndexes.push(index);
    }

    return {
      tx,
      // tslint:disable-next-line:object-literal-sort-keys
      globalOutputIndexes,
    };
  }

  public static writeEntry(
    writer: BufferStreamWriter,
    entry: ITransactionEntry
  ) {
    Transaction.write(writer, entry.tx);
    writer.writeVarint(entry.globalOutputIndexes.length);
    for (const index of entry.globalOutputIndexes) {
      writer.writeVarint(index);
    }
  }

  public static write(writer: BufferStreamWriter, transaction: ITransaction) {
    TransactionPrefix.write(writer, transaction.prefix);
    assert(transaction.signatures.length === transaction.prefix.inputs.length);
    // this.writeSignatures(writer, transaction.prefix, transaction.signatures);
    this.writeSignatures(writer, transaction.signatures);
  }

  public static toBuffer(transaction: ITransaction): Buffer {
    const writer = new BufferStreamWriter(Buffer.alloc(0));
    Transaction.write(writer, transaction);
    return writer.getBuffer();
  }

  public static hash(transaction: ITransaction): IHash {
    const hashStr = CNFashHash(Transaction.toBuffer(transaction));
    const hash = Buffer.from(hashStr, 'hex');
    return hash;
  }

  public static size(transaction: ITransaction): usize {
    return Transaction.toBuffer(transaction).length;
  }

  public transction?: ITransaction;
  public extra?: TransactionExtra;
  public hash?: IHash;
  public secretKey?: IPrivateKey;
  public version?: uint8;

  constructor(version: uint8, create?: boolean) {
    if (create) {
      this.version = version;
      const txKeys = Key.generateKeys();
      const pk: ITransactionExtraPublicKey = {
        key: txKeys.public,
      };

      const extra = new TransactionExtra();
      extra.add({
        data: pk,
        tag: ITransactionExtraTag.PUBKEY,
      });

      const prefix: ITransactionPrefix = {
        extra: extra.toBuffer(),
        inputs: [],
        outputs: [],
        unlockTime: 0,
        version,
      };

      const transaction: ITransaction = {
        prefix,
        signatures: [],
      };
      this.transction = transaction;
      this.secretKey = txKeys.secret;
    }
  }
}
