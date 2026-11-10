
const express = require("express");
const Docker = require("dockerode");
const path = require("path");

const app = express();

const PORT = Number(process.env.PORT || 4300);

const docker = new Docker({
    socketPath: process.env.DOCKER_SOCKET ||
        "/var/run/docker.sock"
});

const targetName =
    process.env.MONITORED_CONTAINER ||
    "nimbustrace-monitored-app";

app.use(express.json());

app.use(express.static(
    path.join(__dirname, "public")
));


// Application metrics

let requestCount = 0;

let recoveryCount = 0;

const startedAt = Date.now();


// Count requests

app.use((req, res, next) => {

    requestCount++;

    next();

});


// Health API

app.get("/health", (req, res) => {

    res.json({

        status: "ok",

        service: "nimbustrace-dashboard",

        uptimeSeconds: Math.floor(process.uptime())

    });

});


// Dashboard overview API

app.get("/api/overview", async (req, res) => {

    try {

        const container = docker.getContainer(targetName);

        const info = await container.inspect();

        res.json({

            service: targetName,

            status: info.State.Running ? "UP" : "DOWN",

            containerState: info.State.Status,

            uptimeSeconds: Math.floor(
                (Date.now() - startedAt) / 1000
            ),

            requestCount,

            recoveryCount

        });

    } catch (error) {

        res.status(503).json({

            service: targetName,

            status: "UNKNOWN",

            error: error.message,

            requestCount,

            recoveryCount

        });

    }

});


// Recovery API

app.post("/api/recovery/restart", async (req, res) => {

    try {

        const container = docker.getContainer(targetName);

        await container.restart({
            t: 5
        });

        recoveryCount++;

        res.json({

            success: true,

            message: "Monitored service restarted successfully",

            recoveryCount

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: "Restart failed",

            error: error.message

        });

    }

});


// Prometheus metrics endpoint

app.get("/metrics", async (req, res) => {

    let monitoredAppUp = 0;

    try {

        const info = await docker
            .getContainer(targetName)
            .inspect();

        monitoredAppUp =
            info.State.Running ? 1 : 0;

    } catch (error) {

        monitoredAppUp = 0;

    }

    const metrics = [

        "# HELP nimbustrace_dashboard_up Dashboard status",

        "# TYPE nimbustrace_dashboard_up gauge",

        "nimbustrace_dashboard_up 1",

        "# HELP nimbustrace_monitored_app_up Monitored app status",

        "# TYPE nimbustrace_monitored_app_up gauge",

        `nimbustrace_monitored_app_up ${monitoredAppUp}`,

        "# HELP nimbustrace_http_requests_total Total requests",

        "# TYPE nimbustrace_http_requests_total counter",

        `nimbustrace_http_requests_total ${requestCount}`,

        "# HELP nimbustrace_recovery_total Total recovery actions",

        "# TYPE nimbustrace_recovery_total counter",

        `nimbustrace_recovery_total ${recoveryCount}`

    ].join("\n");

    res.type("text/plain").send(metrics + "\n");

});


// Start backend server

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `NimbusTrace dashboard running on port ${PORT}`
    );

});

