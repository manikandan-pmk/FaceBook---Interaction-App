#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1929b64aaaf75de6e31885926b0eae127c6562597ecd18b34051d452d509a6df/contract';
import endContract from '../../snapshots/1929b64aaaf75de6e31885926b0eae127c6562597ecd18b34051d452d509a6df/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f99307942848dab39b3a661beb2a88cdded75e936ccb8ea70ae6cf2b7498fc46/contract';
import startContract from '../../snapshots/f99307942848dab39b3a661beb2a88cdded75e936ccb8ea70ae6cf2b7498fc46/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Post',
        column: col('status', 'text', {
          notNull: true,
          default: lit('Inactive'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Post',
        constraint: 'Post_status_check_b0bca701',
        expression: sql`"status" IN ('Active', 'Inactive', 'Rejected')`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
