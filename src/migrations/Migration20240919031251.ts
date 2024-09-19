import { Migration } from '@mikro-orm/migrations';

export class Migration20240919031251 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "guild_vendor_tally" drop constraint "guild_vendor_tally_vendor_id_guild_id_timestamp_timeframe_uniqu";`);

    this.addSql(`alter table "guild_vendor_tally" add constraint "guild_vendor_tally_vendor_id_guild_id_timestamp_timeframe_unique" unique ("vendor_id", "guild_id", "timestamp", "timeframe");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "guild_vendor_tally" drop constraint "guild_vendor_tally_vendor_id_guild_id_timestamp_timeframe_unique";`);

    this.addSql(`CREATE UNIQUE INDEX guild_vendor_tally_vendor_id_guild_id_timestamp_timeframe_uniqu ON public.guild_vendor_tally USING btree (vendor_id, guild_id, "timestamp", timeframe);`);
  }

}
