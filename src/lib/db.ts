
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "../../prisma/contract.d";
import contractJson from "../../prisma/contract.json" with { type: "json" };

const contract = contractFromJson<Contract>(contractJson);

const db = postgres({
  contract,
  url: process.env.DATABASE_URL!,
});

export default db;
