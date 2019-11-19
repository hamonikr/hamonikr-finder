import { RoundRobinRedisPool, RedisPromise, SnowFlakeCombiner, IdGenerator } from '../dist/index';

let redises = new RoundRobinRedisPool([new RedisPromise()]);
let combiner = new SnowFlakeCombiner(new Date(2006, 0, 1, 0, 0, 0).getTime());

let idGenerator = new IdGenerator(redises, combiner);
console.time('id-generator');
idGenerator.generateIdBatch(10).then((ids) => {
    console.timeEnd('id-generator');
    ids.forEach(id => console.log(id.toString()));
});
