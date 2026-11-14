#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/b0bb3180486c3f2ffa976c7d42005f38bb349823239bd4500e6bb0081c2ec590/contract';
import startContract from '../../snapshots/b0bb3180486c3f2ffa976c7d42005f38bb349823239bd4500e6bb0081c2ec590/contract.json' with { type: 'json' };
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
      this.dropConstraint({
        schema: 'public',
        table: 'Admin',
        constraint: 'Admin_superAdminId_fkey',
        kind: 'foreignKey',
      }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'Admin',
        constraint: 'Admin_role_check_fe981b9b',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'Admin',
        index: 'Admin_superAdminId_idx_0d7bb4bf',
      }),
      this.dropColumn({ schema: 'public', table: 'Admin', column: 'superAdminId' }),
      this.dropTable({ schema: 'public', table: 'SuperAdmin' }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'Teacher',
        constraint: 'Teacher_role_check_fe981b9b',
      }),
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
      this.createTable({
        schema: 'public',
        table: 'RefreshToken',
        columns: [
          col('adminId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('expiresAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('ipAddress', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('jti', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('revokedAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('teacherId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('tokenHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userAgent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'Teacher',
        column: col('status', 'text', {
          notNull: true,
          default: lit('Inactive'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.removeStoredValue({
        schema: 'public',
        table: 'Admin',
        column: 'role',
        value: 'SuperAdmin',
        codecRef: { codecId: 'pg/text@1' },
        enumValue: { namespaceId: 'public', enum: 'Role', member: 'SuperAdmin' },
      }),
      this.removeStoredValue({
        schema: 'public',
        table: 'Teacher',
        column: 'role',
        value: 'SuperAdmin',
        codecRef: { codecId: 'pg/text@1' },
        enumValue: { namespaceId: 'public', enum: 'Role', member: 'SuperAdmin' },
      }),
      this.removeStoredValue({
        schema: 'public',
        table: 'Admin',
        column: 'role',
        value: 'User',
        codecRef: { codecId: 'pg/text@1' },
        enumValue: { namespaceId: 'public', enum: 'Role', member: 'User' },
      }),
      this.removeStoredValue({
        schema: 'public',
        table: 'Teacher',
        column: 'role',
        value: 'User',
        codecRef: { codecId: 'pg/text@1' },
        enumValue: { namespaceId: 'public', enum: 'Role', member: 'User' },
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Admin',
        constraint: 'Admin_role_check_578d1aa1',
        expression: sql`"role" IN ('Admin', 'Teacher')`,
      }),
      this.addUnique({
        schema: 'public',
        table: 'RefreshToken',
        constraint: 'RefreshToken_jti_key',
        columns: ['jti'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'RefreshToken',
        constraint: 'RefreshToken_tokenHash_key',
        columns: ['tokenHash'],
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Teacher',
        constraint: 'Teacher_role_check_578d1aa1',
        expression: sql`"role" IN ('Admin', 'Teacher')`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Teacher',
        constraint: 'Teacher_status_check_cf0b2206',
        expression: sql`"status" IN ('Active', 'Inactive')`,
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
      this.createIndex({
        schema: 'public',
        table: 'RefreshToken',
        index: 'RefreshToken_adminId_idx_530179db',
        columns: ['adminId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RefreshToken',
        index: 'RefreshToken_expiresAt_idx_6b6b8c10',
        columns: ['expiresAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RefreshToken',
        index: 'RefreshToken_teacherId_idx_bc266660',
        columns: ['teacherId'],
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
      this.addForeignKey({
        schema: 'public',
        table: 'RefreshToken',
        foreignKey: {
          name: 'RefreshToken_adminId_fkey',
          columns: ['adminId'],
          references: { schema: 'public', table: 'Admin', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'RefreshToken',
        foreignKey: {
          name: 'RefreshToken_teacherId_fkey',
          columns: ['teacherId'],
          references: { schema: 'public', table: 'Teacher', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
