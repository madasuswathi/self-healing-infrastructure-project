
const express = require("express");

const app = express();

const PORT = Number(process.env.PORT || 4304);


// Health endpoint

app.get("/health", (req, res) => {

    res.json({

        service: "monitored-app",

        status: "UP"

    });

});


// Home endpoint

app.get("/", (req, res) => {

    res.json({

        message: "NimbusTrace monitored demo service",

        status: "running"

    });

});


// Prometheus metrics endpoint

app.get("/metrics", (req, res) => {

    const metrics = [

        "# HELP monitored_app_up Monitored application status",

        "# TYPE monitored_app_up gauge",

        "monitored_app_up 1"

    ].join("\n");

    res.type("text/plain").send(metrics + "\n");

});


// Start service

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Monitored application running on port ${PORT}`
    );

});

