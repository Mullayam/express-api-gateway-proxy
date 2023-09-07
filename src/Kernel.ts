import express, { Application, Request, Response, NextFunction } from 'express'
import { Routes } from './ApiRoutes.js'
import { Services } from './ApiServices.js'
import { HttpException } from './ApiHttpException.js'
const ServiceInstance = new Services()

export class AppServer {
    private PORT: number
    private app: Application
    constructor(PORT: number = 7134) {
        this.PORT = PORT
        this.app = express()
        this.InitializeServices()
        this.LoadMiddlewares()
        this.InitializeRoutes()
        this.ExceptionHandling()
    }
    private Config() {
        this.app.use(express.json())
    }
    private LoadMiddlewares() {

    }
    private ExceptionHandling() {
        Services.info("Exception Handling is Started")
        this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.log(err)
            if (err) HttpException.ExceptionHandler(err, req, res, next)
            next()
        })
    }
    private InitializeRoutes() {
        Services.info("Routes is Mapped Successfully")
        this.app.use(new Routes().router)
        this.app.use("*", (req, res) => {
            Services.info(req.baseUrl + " Route Not Found")
            res.send({ success: false, status: 404, message: "Not Found" })
        })
    }
    private InitializeServices() {
        // Redis Services
    }
    private InitializeApp() {
        Services.info("App is Initialized Successfully")
        this.app.listen(this.PORT, () => {
            Services.info(`App Listening on port ${this.PORT}`)
            Services.text(`Main Instance ${process.pid} is running`);
            Services.log(`App Listening on port ${this.PORT}`)

        })
    }
    RunApplication() {
        if (process.env.CLUSTERS === "true") {
            return ServiceInstance.Workers(() => this.InitializeApp())
        }
        this.InitializeApp()
    }

}