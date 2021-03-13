import { CNFashHash, IHash } from '@vigcoin/crypto';
import { BufferStreamReader, BufferStreamWriter } from '@vigcoin/serializer';
import {
  ETransactionIOType,
  IInputBase,
  IInputKey,
  IInputSignature,
  IOutputKey,
  IOutputSignature,
  ITransactionInput,
  ITransactionInputTarget,
  ITransactionOutput,
  ITransactionPrefix,
} from '@vigcoin/types';

export class TransactionPrefix {
  public static readInput(reader: BufferStreamReader): ITransactionInput {
    const tag = reader.readUInt8();
    let target: ITransactionInputTarget;
    switch (tag) {
      // IInputBase
      case ETransactionIOType.BASE:
        target = {
          blockIndex: reader.readVarint(),
        };
        break;
      // IInputKey
      case ETransactionIOType.KEY:
        {
          const amount = reader.readVarint();
          const size = reader.readVarint();
          const outputs: number[] = [];
          for (let i = 0; i < size; i++) {
            const v = reader.readVarint();
            outputs.push(v);
          }

          const keyImage: Buffer = reader.readHash();

          target = {
            amount,
            keyImage,
            outputIndexes: outputs,
          };
        }
        break;
      // IInputSignature
      case ETransactionIOType.SIGNATURE:
        {
          const amount = reader.readVarint();
          const count = reader.readVarint();
          const outputIndex = reader.readVarint();
          target = {
            amount,
            count,
            outputIndex,
          };
        }
        break;
      default:
        throw new Error('Unknown input variant tag： ' + tag);
    }
    return { tag, target };
  }

  public static writeInput(
    writer: BufferStreamWriter,
    input: ITransactionInput
  ) {
    writer.writeUInt8(input.tag);
    let target: ITransactionInputTarget;
    switch (input.tag) {
      // IInputBase
      case ETransactionIOType.BASE:
        target = input.target as IInputBase;
        writer.writeVarint(target.blockIndex);

        break;
      // IInputKey
      case ETransactionIOType.KEY:
        target = input.target as IInputKey;

        writer.writeVarint(target.amount);
        writer.writeVarint(target.outputIndexes.length);
        const size = target.outputIndexes.length;
        for (let i = 0; i < size; i++) {
          writer.writeVarint(target.outputIndexes[i]);
        }
        writer.writeHash(target.keyImage);
        break;
      // IInputSignature
      case ETransactionIOType.SIGNATURE:
        target = input.target as IInputSignature;

        writer.writeVarint(target.amount);
        writer.writeVarint(target.count);
        writer.writeVarint(target.outputIndex);
        break;
      default:
        throw new Error('Unknown output variant tag');
    }
  }

  public static readOutput(reader: BufferStreamReader) {
    let output: ITransactionOutput;
    const amount = reader.readVarint();
    const tag = reader.readUInt8();

    switch (tag) {
      // IOutputKey
      case ETransactionIOType.KEY:
        output = {
          amount,
          tag,
          target: {
            key: reader.readHash(),
          },
        };
        break;
      // IOutputSignature
      case ETransactionIOType.SIGNATURE:
        const count = reader.readVarint();
        const keys = [];
        for (let i = 0; i < count; i++) {
          keys.push(reader.readHash());
        }
        output = {
          amount,
          tag,
          target: {
            count,
            keys,
          },
        };
        break;
      default:
        throw new Error('Reading unknown ouput variant tag');
    }
    return output;
  }

  public static writeOutput(
    writer: BufferStreamWriter,
    output: ITransactionOutput
  ) {
    writer.writeVarint(output.amount);
    writer.writeUInt8(output.tag);
    let target;
    switch (output.tag) {
      case ETransactionIOType.KEY:
        target = output.target as IOutputKey;
        writer.writeHash(target.key);
        break;
      case ETransactionIOType.SIGNATURE:
        target = output.target as IOutputSignature;
        writer.writeVarint(target.count);
        for (let i = 0; i < target.count; i++) {
          writer.writeHash(target.keys[i]);
        }
        break;
      default:
        throw new Error('Writing unknown output variant tag');
    }
  }

  public static readExtra(reader: BufferStreamReader) {
    const size = reader.readVarint();
    const buffer = reader.read(size);
    return buffer;
  }

  public static writeExtra(writer: BufferStreamWriter, extra: Buffer) {
    writer.writeVarint(extra.length);

    writer.write(extra);
  }

  public static read(reader: BufferStreamReader): ITransactionPrefix {
    const version = reader.readVarint();
    const unlockTime = reader.readVarint();
    const sizeInput = reader.readVarint();
    const inputs = [];
    for (let i = 0; i < sizeInput; i++) {
      inputs.push(TransactionPrefix.readInput(reader));
    }
    const sizeOutput = reader.readVarint();
    const outputs = [];
    for (let i = 0; i < sizeOutput; i++) {
      outputs.push(TransactionPrefix.readOutput(reader));
    }

    const extra = TransactionPrefix.readExtra(reader);
    return {
      version,
      // tslint:disable-next-line:object-literal-sort-keys
      unlockTime,
      inputs,
      outputs,
      extra,
    };
  }

  public static write(writer: BufferStreamWriter, prefix: ITransactionPrefix) {
    writer.writeVarint(prefix.version);
    writer.writeVarint(prefix.unlockTime);
    writer.writeVarint(prefix.inputs.length);
    const sizeInput = prefix.inputs.length;
    for (let i = 0; i < sizeInput; i++) {
      TransactionPrefix.writeInput(writer, prefix.inputs[i]);
    }
    writer.writeVarint(prefix.outputs.length);
    const sizeOutput = prefix.outputs.length;
    for (let i = 0; i < sizeOutput; i++) {
      TransactionPrefix.writeOutput(writer, prefix.outputs[i]);
    }
    TransactionPrefix.writeExtra(writer, prefix.extra);
  }

  public static toBuffer(prefix: ITransactionPrefix): Buffer {
    const writer = new BufferStreamWriter();
    TransactionPrefix.write(writer, prefix);
    return writer.getBuffer();
  }

  public static hash(prefix: ITransactionPrefix): IHash {
    const hashStr = CNFashHash(TransactionPrefix.toBuffer(prefix));
    const hash = Buffer.from(hashStr, 'hex');
    return hash;
  }
}
