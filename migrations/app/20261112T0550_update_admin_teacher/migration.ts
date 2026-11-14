#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0068832f3e36dfcf3facf673e775fa8e33f15623c01385709549af820eb9981c/contract';
import endContract from '../../snapshots/0068832f3e36dfcf3facf673e775fa8e33f15623c01385709549af820eb9981c/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/ae7d54f153796f099238c7d3dad71f00fa6c4b3c6adca9e791a39a7b9cc68673/contract';
import startContract from '../../snapshots/ae7d54f153796f099238c7d3dad71f00fa6c4b3c6adca9e791a39a7b9cc68673/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-postgres/migration';

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
      this.dropConstraint({
        schema: 'public',
        table: 'RefreshToken',
        constraint: 'RefreshToken_superAdminId_fkey',
        kind: 'foreignKey',
      }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'Admin',
        constraint: 'Admin_role_check_897d42b2',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'Admin',
        index: 'Admin_superAdminId_idx_0d7bb4bf',
      }),
      this.dropColumn({ schema: 'public', table: 'Admin', column: 'superAdminId' }),
      this.dropIndex({
        schema: 'public',
        table: 'RefreshToken',
        index: 'RefreshToken_superAdminId_idx_0d7bb4bf',
      }),
      this.dropColumn({ schema: 'public', table: 'RefreshToken', column: 'superAdminId' }),
      this.dropTable({ schema: 'public', table: 'SuperAdmin' }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'Teacher',
        constraint: 'Teacher_role_check_897d42b2',
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
      this.addCheckConstraint({
        schema: 'public',
        table: 'Admin',
        constraint: 'Admin_role_check_578d1aa1',
        expression: sql`"role" IN ('Admin', 'Teacher')`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Teacher',
        constraint: 'Teacher_role_check_578d1aa1',
        expression: sql`"role" IN ('Admin', 'Teacher')`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
