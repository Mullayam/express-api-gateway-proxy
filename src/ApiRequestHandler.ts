import { createClient } from "redis";
import type { RedisClientType } from "redis";
import { Services } from "./ApiServices.js";

export class ApiFunctions {
  public cache: RedisClientType;
  constructor() {
    this.cache = createClient({
      password: '',
      socket: {
        host: '',
        port: 19063
      }
    });
    this.ConnectRedisClient()
  }

  private async ConnectRedisClient() {
    this.cache.on("error", (error: any) => Services.error(`Error : ${error}`));
    await this.cache.connect().then(() => Services.log(`Redis Connected Successfully`)).catch((error: any) => console.error(`Error : ${error}`));
  }
  clearCache() {
    this.cache.flushAll();
  }
  clearHash(hashKey:string) {
    this.cache.del(JSON.stringify(hashKey));
  }
 
}