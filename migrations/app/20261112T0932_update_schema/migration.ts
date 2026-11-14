#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0068832f3e36dfcf3facf673e775fa8e33f15623c01385709549af820eb9981c/contract';
import startContract from '../../snapshots/0068832f3e36dfcf3facf673e775fa8e33f15623c01385709549af820eb9981c/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/da6f15af5ab1becc9ef67f3d3979150c663ca1d744f8a444bc79bf542071abc6/contract';
import endContract from '../../snapshots/da6f15af5ab1becc9ef67f3d3979150c663ca1d744f8a444bc79bf542071abc6/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Teacher',
        column: col('status', 'text', {
          notNull: true,
          default: lit('Inactive'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Teacher',
        constraint: 'Teacher_status_check_cf0b2206',
        expression: sql`"status" IN ('Active', 'Inactive')`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
