#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/39c408bb28fedc36bf3585975e09d1dfdcb37c3fc18828fd203da29bbfc5b9f5/contract';
import endContract from '../../snapshots/39c408bb28fedc36bf3585975e09d1dfdcb37c3fc18828fd203da29bbfc5b9f5/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/53aa8d75085609925622ac45568d273979e27ba8912dc49cbf2a9fdb5b7c57b0/contract';
import startContract from '../../snapshots/53aa8d75085609925622ac45568d273979e27ba8912dc49cbf2a9fdb5b7c57b0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.setDefault({
        schema: 'public',
        table: 'Advertisement',
        column: col('isActive', 'bool', {
          default: lit(false),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
