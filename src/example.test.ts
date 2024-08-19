import {
  Entity,
  ManyToOne,
  MikroORM,
  Opt,
  PrimaryKey,
  Property,
  wrap,
} from "@mikro-orm/postgresql";

@Entity()
class Brand {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;
}

@Entity()
class Product {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @ManyToOne({
    entity: () => Brand,
    nullable: true,
    index: true,
    default: null,
  })
  brand?: Brand & Opt;
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ":memory:",
    entities: [Brand, Product],
    debug: ["query", "query-params"],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
});

test("setup", async () => {
  const brand = orm.em
    .getRepository(Brand)
    .create({ id: 1, name: "The brand" });
  const product = orm.em
    .getRepository(Product)
    .create({ id: 1, name: "Test Product", brand: brand });
  await orm.em.flush();
  orm.em.clear();

  expect(brand).not.toBeNull();
  expect(product).not.toBeNull();
  expect(product.brand).not.toBeNull();
});

test("update the brand null with assign", async () => {
  const newData = {
    name: "Test Product Brand NULL with assign",
    brand: null,
  };
  const item = orm.em.getRepository(Product).getReference(1);

  const wrappedEntity = wrap(item);

  wrappedEntity.assign(newData, {
    updateByPrimaryKey: false,
    mergeObjectProperties: true,
  });
  orm.em.persist(item);
  await orm.em.flush();
  orm.em.clear();

  const product = await orm.em.getRepository(Product).findOne(1);

  expect(product).not.toBeNull(); // Ensure the product was found
  expect(product!.name).toBe("Test Product Brand NULL with assign");
  expect(product!.brand).toBeNull(); // Check if the brand is null

  const brand = orm.em.getRepository(Brand).getReference(1);
  wrap(product!).assign(
    {
      brand,
    },
    {
      updateByPrimaryKey: false,
      mergeObjectProperties: true,
    }
  );
  orm.em.persist(item);
  await orm.em.flush();
  const productWithBrand = await orm.em.getRepository(Product).findOne(1);
  expect(productWithBrand!.brand).not.toBeNull(); // Check if the brand is null
});

test("run a findOne then update the brand null", async () => {
  const newData = {
    name: "Test Product findOne then NULL",
    brand: null,
  };
  const item = orm.em.getRepository(Product).getReference(1);

  const wrappedEntity = wrap(item);

  // run findOne to do some check before assign
  await orm.em.getRepository(Product).findOne(item, {
    fields: ["id", "name"],
  });

  wrappedEntity.assign(newData, {
    updateByPrimaryKey: false,
    mergeObjectProperties: true,
  });
  orm.em.persist(item);
  await orm.em.flush();
  orm.em.clear();

  const product = await orm.em.getRepository(Product).findOne(1);

  expect(product).not.toBeNull(); // Ensure the product was found
  expect(product!.name).toBe("Test Product findOne then NULL");
  expect(product!.brand).toBeNull(); // Check if the brand is null

  const brand = orm.em.getRepository(Brand).getReference(1);
  wrap(product!).assign(
    {
      brand,
    },
    {
      updateByPrimaryKey: false,
      mergeObjectProperties: true,
    }
  );
  orm.em.persist(item);
  await orm.em.flush();
  const productWithBrand = await orm.em.getRepository(Product).findOne(1);
  expect(productWithBrand!.brand).not.toBeNull(); // Check if the brand is null
});

test("run a wrap.load then update the brand null", async () => {
  const newData = {
    name: "Test Product wrap.load then NULL",
    brand: null,
  };
  const item = orm.em.getRepository(Product).getReference(1);

  const wrappedEntity = wrap(item);

  // run wrap.init to do some check before assign
  await wrappedEntity.init({
    fields: ["id", "name"],
  });

  wrappedEntity.assign(newData, {
    updateByPrimaryKey: false,
    mergeObjectProperties: true,
  });
  orm.em.persist(item);
  await orm.em.flush();
  orm.em.clear();

  const product = await orm.em.getRepository(Product).findOne(1);
  console.log(
    "This product here will have the brand = 'NULL' skipped in its update query.",
    product
  );

  expect(product).not.toBeNull(); // Ensure the product was found
  expect(product!.name).toBe("Test Product wrap.init then NULL");
  expect(product!.brand).toBeNull(); // Check if the brand is null

  const brand = orm.em.getRepository(Brand).getReference(1);
  wrap(product!).assign(
    {
      brand,
    },
    {
      updateByPrimaryKey: false,
      mergeObjectProperties: true,
    }
  );
  orm.em.persist(item);
  await orm.em.flush();
  const productWithBrand = await orm.em.getRepository(Product).findOne(1);
  expect(productWithBrand!.brand).not.toBeNull(); // Check if the brand is null
});

test("run a wrap.init then update the brand null", async () => {
  const newData = {
    name: "Test Product wrap.init then NULL",
    brand: null,
  };
  const item = orm.em.getRepository(Product).getReference(1);

  const wrappedEntity = wrap(item);

  // run wrap.init to do some check before assign
  await wrappedEntity.init({
    fields: ["id", "name"],
  });

  wrappedEntity.assign(newData, {
    updateByPrimaryKey: false,
    mergeObjectProperties: true,
  });
  orm.em.persist(item);
  await orm.em.flush();
  orm.em.clear();

  const product = await orm.em.getRepository(Product).findOne(1);
  console.log("PRODUCT HERE", product);

  expect(product).not.toBeNull(); // Ensure the product was found
  expect(product!.name).toBe("Test Product wrap.init then NULL");
  expect(product!.brand).toBeNull(); // Check if the brand is null

  const brand = orm.em.getRepository(Brand).getReference(1);
  wrap(product!).assign(
    {
      brand,
    },
    {
      updateByPrimaryKey: false,
      mergeObjectProperties: true,
    }
  );
  orm.em.persist(item);
  await orm.em.flush();
  const productWithBrand = await orm.em.getRepository(Product).findOne(1);
  expect(productWithBrand!.brand).not.toBeNull(); // Check if the brand is null
});

afterAll(async () => {
  await orm.close(true);
});
