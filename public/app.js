
const serviceStatus = document.getElementById("serviceStatus");
const containerState = document.getElementById("containerState");
const uptime = document.getElementById("uptime");
const requestCount = document.getElementById("requestCount");
const recoveryCount = document.getElementById("recoveryCount");
const appHealth = document.getElementById("appHealth");

const restartButton = document.getElementById("restartButton");
const actionMessage = document.getElementById("actionMessage");
const incidentFeed = document.getElementById("incidentFeed");


// Fetch dashboard data from backend

async function fetchDashboardData() {

    try {

        const response = await fetch("/api/overview");

        const data = await response.json();

        serviceStatus.textContent = data.status || "UNKNOWN";

        containerState.textContent =
            "Container state: " + (data.containerState || "unknown");

        uptime.textContent =
            data.uptimeSeconds + "s";

        requestCount.textContent =
            data.requestCount;

        recoveryCount.textContent =
            data.recoveryCount;

        appHealth.textContent =
            data.status || "UNKNOWN";

        if (data.status === "UP") {

            serviceStatus.style.color = "#36d9cf";

        } else {

            serviceStatus.style.color = "#f34f91";

        }

    } catch (error) {

        serviceStatus.textContent = "API ERROR";

        containerState.textContent = error.message;

    }

}


// Add incident activity

function addIncident(title, message) {

    const incident = document.createElement("p");

    incident.textContent =
        new Date().toLocaleTimeString() +
        " - " +
        title +
        ": " +
        message;

    incidentFeed.prepend(incident);

    while (incidentFeed.children.length > 5) {

        incidentFeed.lastElementChild.remove();

    }

}


// Restart monitored service

restartButton.addEventListener("click", async function () {

    restartButton.disabled = true;

    actionMessage.textContent =
        "Restarting monitored service...";

    try {

        const response = await fetch(
            "/api/recovery/restart",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({})
            }
        );

        const data = await response.json();

        actionMessage.textContent =
            data.message || data.error;

        addIncident(
            "Recovery Action",
            data.message || data.error
        );

        await fetchDashboardData();

    } catch (error) {

        actionMessage.textContent =
            "Recovery failed: " + error.message;

        addIncident(
            "Recovery Failed",
            error.message
        );

    } finally {

        restartButton.disabled = false;

    }

});


// Initial dashboard loading

fetchDashboardData();


// Refresh every 5 seconds

setInterval(fetchDashboardData, 5000);

