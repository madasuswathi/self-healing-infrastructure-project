const http = require("http");
const { execFile } = require("child_process");

const PORT = 4305;
const RECOVERY_SCRIPT = "/home/vagrant/vagrant/scripts/recover-service.sh";

let recoveryInProgress = false;

const server = http.createServer((req, res) => {
    if (req.method !== "POST" || req.url !== "/webhook") {
        res.writeHead(404);
        return res.end("Not Found");
    }

    let body = "";

    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", () => {
        let payload;

        try {
            payload = JSON.parse(body);
        } catch (error) {
            res.writeHead(400);
            return res.end("Invalid JSON");
        }

        const alerts = payload.alerts || [];

        const recoveryAlerts = alerts.filter(alert =>
            alert.status === "firing" &&
            alert.labels &&
            alert.labels.alertname === "MonitoredAppDown"
        );

        if (recoveryAlerts.length === 0) {
            res.writeHead(200);
            return res.end("No recovery alert required");
        }

        if (recoveryInProgress) {
            res.writeHead(200);
            return res.end("Recovery already in progress");
        }

        recoveryInProgress = true;
        console.log("MonitoredAppDown alert received. Starting recovery.");

        // Acknowledge Alertmanager before the recovery process finishes.
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            status: "accepted",
            message: "Recovery process started"
        }));

        execFile("bash", [RECOVERY_SCRIPT], (error, stdout, stderr) => {
            recoveryInProgress = false;

            if (error) {
                console.error("Recovery failed:", stderr || error.message);
                return;
            }

            console.log("Recovery completed:", stdout);
        });
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Alertmanager webhook receiver running on port ${PORT}`);
});
