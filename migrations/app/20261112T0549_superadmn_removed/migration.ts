#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0068832f3e36dfcf3facf673e775fa8e33f15623c01385709549af820eb9981c/contract';
import endContract from '../../snapshots/0068832f3e36dfcf3facf673e775fa8e33f15623c01385709549af820eb9981c/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/b0bb3180486c3f2ffa976c7d42005f38bb349823239bd4500e6bb0081c2ec590/contract';
import startContract from '../../snapshots/b0bb3180486c3f2ffa976c7d42005f38bb349823239bd4500e6bb0081c2ec590/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

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
