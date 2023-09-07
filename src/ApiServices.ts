import * as os from "os";
import winston from 'winston';
import cluster from 'cluster';
import path,{dirname} from 'path';
import { fileURLToPath } from "url";
import { yellow, red, blue } from "colorette";
import { LoggingLevel, LoggingOptions } from './types.js';
import { createLogger, format, transports } from 'winston';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LogsPath = path.join(process.cwd(), 'logs');
const { combine, timestamp, label, printf, colorize } = format;
const clusterWorkerSize = os.cpus().length;
export class Services {


    private LoggingOptions(): LoggingOptions {
        return {
            file: {
                level: "info",
                filename: `${LogsPath}/apps.log`,
                handleExceptions: true,
                json: false,
                maxsize: 5242880, // 5MB
                maxFiles: 5,
                colorize: false,
                // format: winston.format.json(),
            },
            console: {
                level: "debug",

                handleExceptions: true,
                json: false,
                colorize: true,
                format: winston.format.simple(),
            },
        }
    }
    private HandleCreateLogger(level: LoggingLevel = "debug") {
        return createLogger({
            format: combine(
                // colorize({ all: true, level: true, message: true, colors: Colors }),
                timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                printf((info) => `[RedBeryl] ${info.level.toUpperCase()} ${info.timestamp} - ${info.message}`)
            ),
            levels: winston.config.syslog.levels,
            transports: [
                new transports.File({
                    filename: `${LogsPath}/error.log`,
                    level: level,
                }),
                new transports.File(this.LoggingOptions().file),
                new transports.Console(this.LoggingOptions().console),
            ],
            rejectionHandlers: [
                new transports.File({ filename: `${LogsPath}/rejection.log` }),
            ],
            exceptionHandlers: [
                new transports.File({ filename: `${LogsPath}/error.log` }),
            ],
            exitOnError: false,
        });
    }
    private LogsColors(): Record<LoggingLevel, string> {
        return {
            info: "blue",
            error: "red",
            alert: "yellow",
            debug: "magenta",
            crit: "red",
            emerg: "white",
            notice: "cyan"
        }
    }
    static info(message: string) {
        return this.prototype.HandleCreateLogger("info").info(message)
    }
    static error(message: string) {
        console.log(red(`${message}`))
        return
    }
    static log(text: string) {
        console.log(yellow(`----------- ${text} -------------`))
        return
    };
    static text(text: string) {
        console.log(blue(`----------- ${text} -------------`))
        return
    };

    //  Cluster Modules
    Workers(RunApplication: () => void) {
        // cluster.setupPrimary({
        //     exec: __dirname + "/kernel.js",
        //   });
        Services.log("Max CPU Found " + clusterWorkerSize)        
        if (cluster.isPrimary) {
            Services.text(`Main Instance ${process.pid} is running`);
            // Fork workers.
            for (let i = 0; i < clusterWorkerSize; i++) {
                cluster.fork();
                Services.info(`ClusterWorket ${i} is running`);
            }
            cluster.on("exit", (worker, code, signal) => {
                console.log(`worker ${worker.process.pid} has been killed`);
                console.log("Starting another worker");
                cluster.fork();
              });
        } else {
            Services.text("Cluster Instance is Running")
            RunApplication()
        }

    }

}