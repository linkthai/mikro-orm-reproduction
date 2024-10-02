import { Collection, Entity, ManyToOne, MikroORM, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/postgresql';

@Entity()
class MediaSet {

  @PrimaryKey()
  id!: number;

  @OneToMany({
    entity: () => Media,
    mappedBy: (media) => media.set,
  })
  medias = new Collection<Media>(this);
}

@Entity() 
class Media {

  @PrimaryKey()
  id!: number;

  @ManyToOne({
    entity: () => MediaSet,
    nullable: true,
    index: true,
    default: null,
  })
  set: MediaSet;

  @Property({ type: 'text'})
  url: string;

  constructor({ url, set }: { url: string; set: MediaSet}) {
    this.url = url;
    this.set = set
  }
}

@Entity()
class Product {

  @PrimaryKey()
  id!: number;

  @OneToOne({
    entity: () => MediaSet,
    nullable: false,
  })
  imageList: MediaSet;

  constructor({ imageList }: { imageList: MediaSet }) {
    this.imageList = imageList
  }
}


let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ':memory:',
    entities: [Product, MediaSet, Media],
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test('basic CRUD example', async () => {
  const mediaSet = new MediaSet()
  mediaSet.medias.add(new Media({ url: 'test', set: mediaSet }))

  const product = new Product({ imageList: mediaSet })
  product.id = 0;

  orm.em.create(Product, product);
  await orm.em.flush();
  orm.em.clear();

  const currentProduct = await orm.em.findOneOrFail(Product, 0, {
    fields: ['id', 'imageList.id', 'imageList.medias.id', 'imageList.medias.url'],
  });
  expect(currentProduct.imageList.medias.count()).toBe(1);
});
