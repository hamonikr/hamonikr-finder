# An ID Generator Based On Redis And Nodejs

Support snowflake k-sortable unique id and serial number. Inspired by [intenthq/icicle](https://github.com/intenthq/icicle)

Attention: this is not a stable project, run with your own risk.

## Usage

```
import { RoundRobinRedisPool, RedisPromise, SnowFlakeCombiner, IdGenerator } from 'node-id-generator';

let redises = new RoundRobinRedisPool([new RedisPromise()]);
let combiner = new SnowFlakeCombiner(new Date(2006, 0, 1, 0, 0, 0).getTime());

let idGenerator = new IdGenerator(redises, combiner);
console.time('id-generator');
idGenerator.generateIdBatch(10).then((ids) => {
    console.timeEnd('id-generator');
    ids.forEach(id => console.log(id.toString()));
});
```

There are two combiner supported right now. use `SnowFlakeCombiner` to generate snowflake id, such as: **1596126791586545665**, and use `YmdNumberCombiner` to generate serial number, such as: **1801220001**.