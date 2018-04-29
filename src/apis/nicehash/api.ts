import * as NiceHash from ".";
import { logger } from "../../logger";
import { request } from "../../utils";

interface IApiResult<T> {
  result: T;
  method: string;
}

interface IRawGlobalPricesCoin {
  price: string;
  algo: number;
}

interface IRawGlobalPrices {
  stats: IRawGlobalPricesCoin[];
}

interface IOrder {
  limit_speed: string;
  alive: boolean;
  price: string;
  id: number;
  type: number;
  workers: number;
  algo: number;
  accepted_speed: string;
}

interface IRawOrders {
  orders: IOrder[];
}

export async function getRawGlobalPrices(): Promise<IApiResult<IRawGlobalPrices>> {
  const rq = await request("https://api.nicehash.com/api?method=stats.global.current");
  const data = JSON.parse(rq.data) as IApiResult<IRawGlobalPrices>;
  return data;
}

export async function cacheGlobalPrices() {
  const data = await getRawGlobalPrices();
  const cache: number[] = [];
  for (const niceHashCost of data.result.stats) {
    cache[niceHashCost.algo] = Number(niceHashCost.price);
  }
  return cache;
}

// Returns the existing orders for an algorithm on NiceHash
export async function getOrders(algo: NiceHash.Algorithm): Promise<IApiResult<IRawOrders>> {
  const rq = await request(`https://api.nicehash.com/api?method=orders.get&algo=${algo.id}`);
  const data = JSON.parse(rq.data) as IApiResult<IRawOrders>;
  return data;
}

// withWorkers - find minimum with workers OR find minimum with some hashrate, only applies if cache is not populated
export async function getPrice(algo: NiceHash.Algorithm, withWorkers?: boolean): Promise<number> {
  const data = await getOrders(algo);
  const orders = data.result.orders;

  // find the lowest order with workers
  let minimumOrder: IOrder = orders[0];
  for (const order of orders) {
    const price = Number(order.price);
    const comparison = withWorkers ? order.workers : order.accepted_speed;
    if (price < Number(minimumOrder.price) && comparison > 0) {
      minimumOrder = order;
    }
  }

  logger.debug("NiceHash.getPrice(): returned from web for " + algo.id);
  const minimumPrice = minimumOrder ? Number(minimumOrder.price) : Infinity;
  return minimumPrice;
}