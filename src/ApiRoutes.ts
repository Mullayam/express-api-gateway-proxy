import { Router } from "express";
import { createProxyMiddleware } from 'http-proxy-middleware'
import { ApiFunctions } from "./ApiRequestHandler.js";
const ServiceInstance = new ApiFunctions()
export class Routes {
    public router: Router;
    constructor() {
        this.router = Router();
        this.AppRoutes()
        this.MappedRoutes()
    }

    private MappedRoutes() {
        let routes = this.Routes()
        for (const route in routes) {
            const target = routes[route]
            this.router.use(route, createProxyMiddleware({ headers: { "X-REDBERYL_API_KEY": "l9GNnvy8Yo0tJFuoJcW2LZHb6itLqcZl" }, target }));
        }

    }
    private AppRoutes() {
        this.router.post("/cache-clear", async (req, res) => {
            await ServiceInstance.clearCache()
            res.status(200).send({ success: true, status: "ok", message: "Cache Cleared" })
        })
    }
    private Routes(): Record<string, string> {
        return {
            "/v1/init/txn": "https://api.redberyl.co"
        }
    }

}