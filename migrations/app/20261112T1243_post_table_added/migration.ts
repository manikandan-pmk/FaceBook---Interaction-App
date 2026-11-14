#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/da6f15af5ab1becc9ef67f3d3979150c663ca1d744f8a444bc79bf542071abc6/contract';
import startContract from '../../snapshots/da6f15af5ab1becc9ef67f3d3979150c663ca1d744f8a444bc79bf542071abc6/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/f99307942848dab39b3a661beb2a88cdded75e936ccb8ea70ae6cf2b7498fc46/contract';
import endContract from '../../snapshots/f99307942848dab39b3a661beb2a88cdded75e936ccb8ea70ae6cf2b7498fc46/contract.json' with { type: 'json' };
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
        table: 'Post',
        columns: [
          col('caption', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('likes', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('media', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('shares', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('teacherId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('TEXT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('views', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('Post_type_check_3926ae79', sql`"type" IN ('TEXT', 'IMAGE', 'VIDEO')`),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Post',
        index: 'Post_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Post',
        index: 'Post_teacherId_idx_bc266660',
        columns: ['teacherId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Post',
        index: 'Post_type_idx_b6b604ea',
        columns: ['type'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Post',
        foreignKey: {
          name: 'Post_teacherId_fkey',
          columns: ['teacherId'],
          references: { schema: 'public', table: 'Teacher', columns: ['teacherId'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
