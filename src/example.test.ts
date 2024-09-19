import { Migrator } from "@mikro-orm/migrations";
import {
  Entity,
  ManyToOne,
  MikroORM,
  PrimaryKey,
  Property,
  Unique
} from "@mikro-orm/postgresql";

@Entity()
class Guild {
  @PrimaryKey()
  id!: number;
}

@Entity()
class Vendor {
  @PrimaryKey()
  id!: number;
}

@Unique({ properties: ['vendor', 'guild', 'timestamp', 'timeframe'] })
@Entity()
class GuildVendorTally {
  @PrimaryKey()
  id!: number;

  @Property({
    type: 'text',
  })
  timeframe: string;

  @Property({ type: 'text' })
  timestamp: string;

  @ManyToOne({
    entity: () => Guild,
    nullable: false,
  })
  guild: Guild;

  @ManyToOne({
    entity: () => Vendor,
    nullable: false,
  })
  vendor: Vendor;

  constructor(timeframe: string, timestamp: string, guild: Guild, vendor: Vendor) {
    this.timeframe = timeframe;
    this.timestamp = timestamp;
    this.guild = guild;
    this.vendor = vendor;
  }
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: "mikro_orm_test",
    entities: [GuildVendorTally],
    debug: ["query", "query-params"],
    allowGlobalContext: true, // only for testing
    extensions: [Migrator],
    schemaGenerator: {
      disableForeignKeys: false,
    },
    migrations: {
      path: './src/migrations',
      transactional: true,
      allOrNothing: true,
      disableForeignKeys: false,
      snapshot: false,
    },
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test("check migration", async () => {
  const migrationNeeded = await orm.migrator.checkMigrationNeeded()
  const migration = await orm.migrator.createMigration()
  console.log(migrationNeeded, migration)

  expect(migrationNeeded).toBe(false);
});

// test("check migration again", async () => {
//   const migrator = orm.getMigrator();

//   const migrationNeeded = await migrator.checkMigrationNeeded()
//   const migration = await migrator.createMigration()
//   console.log(migrationNeeded, migration)

//   expect(migrationNeeded).toBe(false);
// });