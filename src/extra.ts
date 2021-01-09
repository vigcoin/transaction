import { IPublicKey } from '@vigcoin/crypto';
import { BufferStreamReader, BufferStreamWriter } from '@vigcoin/serializer';
import {
  ITransactionExtra,
  ITransactionExtraNonce,
  ITransactionExtraPadding,
  ITransactionExtraPublicKey,
  ITransactionExtraTag,
  TX_EXTRA_NONCE_MAX_COUNT,
  TX_EXTRA_PADDING_MAX_COUNT,
} from '@vigcoin/types';

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
        default:
          throw new Error('Wrong tag!');
      }
    }
    return true;
  }

  public static read(extra: Buffer): ITransactionExtra[] {
    const reader = new BufferStreamReader(extra);
    const parsed: ITransactionExtra[] = [];
    let size = 0;
    let tagCached = false;
    let tag;
    while (reader.getRemainedSize() > 0) {
      if (!tagCached) {
        tag = reader.readUInt8();
      }
      tagCached = false;
      switch (tag) {
        case ITransactionExtraTag.PADDING:
          size = 1;
          for (; size <= TX_EXTRA_PADDING_MAX_COUNT; size++) {
            if (reader.getRemainedSize() > 0) {
              const pad = reader.readUInt8();
              if (pad !== 0) {
                tag = pad;
                tagCached = true;
                break;
              }
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
            nonce = reader.read(size + 1);
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
