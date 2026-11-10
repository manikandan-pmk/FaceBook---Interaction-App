#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/b0bb3180486c3f2ffa976c7d42005f38bb349823239bd4500e6bb0081c2ec590/contract';
import endContract from '../../snapshots/b0bb3180486c3f2ffa976c7d42005f38bb349823239bd4500e6bb0081c2ec590/contract.json' with { type: 'json' };
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

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Admin',
        columns: [
          col('adminId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phoneNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('Admin'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('superAdminId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Admin_role_check_fe981b9b',
            sql`"role" IN ('SuperAdmin', 'Admin', 'Teacher', 'User')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'SuperAdmin',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phoneNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('SuperAdmin'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('superAdminId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'SuperAdmin_role_check_fe981b9b',
            sql`"role" IN ('SuperAdmin', 'Admin', 'Teacher', 'User')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Teacher',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phoneNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('Teacher'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('teacherId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Teacher_role_check_fe981b9b',
            sql`"role" IN ('SuperAdmin', 'Admin', 'Teacher', 'User')`,
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Admin',
        constraint: 'Admin_adminId_key',
        columns: ['adminId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Admin',
        constraint: 'Admin_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Admin',
        constraint: 'Admin_phoneNumber_key',
        columns: ['phoneNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'SuperAdmin',
        constraint: 'SuperAdmin_superAdminId_key',
        columns: ['superAdminId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'SuperAdmin',
        constraint: 'SuperAdmin_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'SuperAdmin',
        constraint: 'SuperAdmin_phoneNumber_key',
        columns: ['phoneNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Teacher',
        constraint: 'Teacher_teacherId_key',
        columns: ['teacherId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Teacher',
        constraint: 'Teacher_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Teacher',
        constraint: 'Teacher_phoneNumber_key',
        columns: ['phoneNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Admin',
        index: 'Admin_superAdminId_idx_0d7bb4bf',
        columns: ['superAdminId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Admin',
        foreignKey: {
          name: 'Admin_superAdminId_fkey',
          columns: ['superAdminId'],
          references: { schema: 'public', table: 'SuperAdmin', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
