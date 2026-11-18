#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1929b64aaaf75de6e31885926b0eae127c6562597ecd18b34051d452d509a6df/contract';
import startContract from '../../snapshots/1929b64aaaf75de6e31885926b0eae127c6562597ecd18b34051d452d509a6df/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/53aa8d75085609925622ac45568d273979e27ba8912dc49cbf2a9fdb5b7c57b0/contract';
import endContract from '../../snapshots/53aa8d75085609925622ac45568d273979e27ba8912dc49cbf2a9fdb5b7c57b0/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Advertisement',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('endDate', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('mediaUrl', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('startDate', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('thumbnail', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Advertisement_type_check_bb5fcfda',
            sql`"type" IN ('IMAGE', 'GIF', 'VIDEO', 'YOUTUBE')`,
          ),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Advertisement',
        index: 'Advertisement_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Advertisement',
        index: 'Advertisement_displayOrder_idx_607f1474',
        columns: ['displayOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Advertisement',
        index: 'Advertisement_type_idx_b6b604ea',
        columns: ['type'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
