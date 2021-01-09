import { IPublicKey } from '@vigcoin/crypto';
import { BufferStreamReader, BufferStreamWriter } from '@vigcoin/serializer';
import { usize } from '@vigcoin/types';
import * as assert from 'assert';

export const TX_EXTRA_PADDING_MAX_COUNT = 255;
export const TX_EXTRA_NONCE_MAX_COUNT = 255;

export enum ITransactionExtraTag {
  PADDING = 0x00,
  PUBKEY = 0x01,
  NONCE = 0x02,
}

export interface ITransactionExtraPadding {
  size: usize;
}

export interface ITransactionExtraPublicKey {
  key: IPublicKey;
}

export interface ITransactionExtraNonce {
  nonce: Buffer;
}

export interface ITransactionExtra {
  tag: ITransactionExtraTag;
  data:
    | ITransactionExtraNonce
    | ITransactionExtraPublicKey
    | ITransactionExtraPadding;
}

export class TransactionExtra {
  public static write(
    writer: BufferStreamWriter,
    fields: ITransactionExtra[]
  ): boolean {
    for (const field of fields) {
      switch (field.tag) {
        case ITransactionExtraTag.PADDING:
          const padding = field.data as ITransactionExtraPadding;
          if (padding.size > TX_EXTRA_PADDING_MAX_COUNT) {
            return false;
          }
          writer.write(Buffer.alloc(padding.size, 0));
          break;
        case ITransactionExtraTag.PUBKEY:
          const pubKey = field.data as ITransactionExtraPublicKey;

          writer.writeUInt8(ITransactionExtraTag.PUBKEY);
          writer.write(pubKey.key);
          break;
        case ITransactionExtraTag.NONCE:
          const nonce = field.data as ITransactionExtraNonce;
          if (nonce.nonce.length > TX_EXTRA_NONCE_MAX_COUNT) {
            return false;
          }

          writer.writeUInt8(ITransactionExtraTag.NONCE);
          writer.writeUInt8(nonce.nonce.length);
          writer.write(nonce.nonce);
          break;
      }
    }
    return true;
  }

  public static read(extra: Buffer): ITransactionExtra[] {
    const reader = new BufferStreamReader(extra);
    const parsed: ITransactionExtra[] = [];
    let size = 0;
    while (reader.getRemainedSize() > 0) {
      const tag = reader.readUInt8();
      switch (tag) {
        case ITransactionExtraTag.PADDING:
          size = 1;
          for (; size <= TX_EXTRA_PADDING_MAX_COUNT; size++) {
            if (reader.getRemainedSize() > 0) {
              const pad = reader.readUInt8();
              assert(pad === 0);
            } else {
              break;
            }
          }
          parsed.push({
            data: {
              size,
            },
            tag: ITransactionExtraTag.PADDING,
          });
          break;
        case ITransactionExtraTag.PUBKEY:
          const key: IPublicKey = reader.readHash();
          parsed.push({
            data: {
              key,
            },
            tag: ITransactionExtraTag.PUBKEY,
          });
          break;
        case ITransactionExtraTag.NONCE:
          size = reader.readUInt8();
          let nonce = Buffer.alloc(0);
          if (size > 0) {
            nonce = reader.read(size);
          }
          parsed.push({
            data: {
              nonce,
            },
            tag: ITransactionExtraTag.NONCE,
          });
          break;
        default:
          throw new Error('Wrong tag!');
      }
    }
    return parsed;
  }

  public static getNonce(buffer: Buffer): Buffer | null {
    const extras = TransactionExtra.read(buffer);
    let nonce = null;
    for (const extra of extras) {
      const temp = extra.data as ITransactionExtraNonce;
      if (temp.nonce && temp.nonce.length) {
        nonce = temp.nonce;
        break;
      }
    }
    return nonce;
  }

  private fields: ITransactionExtra[] = [];

  public add(extra: ITransactionExtra) {
    this.fields.push(extra);
  }

  public toBuffer(): Buffer {
    const writer = new BufferStreamWriter();
    if (TransactionExtra.write(writer, this.fields)) {
      return writer.getBuffer();
    }
    return Buffer.alloc(0);
  }
}
