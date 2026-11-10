
const test = require("node:test");

const assert = require("node:assert/strict");

const fs = require("node:fs");

const pkg = require("../package.json");


test("Project package name is correct", () => {

    assert.equal(
        pkg.name,
        "nimbustrace-self-healing"
    );

});


test("Frontend HTML file exists", () => {

    assert.ok(
        fs.existsSync("public/index.html")
    );

});


test("Frontend CSS file exists", () => {

    assert.ok(
        fs.existsSync("public/styles.css")
    );

});


test("Frontend JavaScript file exists", () => {

    assert.ok(
        fs.existsSync("public/app.js")
    );

});


test("Prometheus configuration exists", () => {

    assert.ok(
        fs.existsSync("monitoring/prometheus.yml")
    );

});


test("Alert rules exist", () => {

    assert.ok(
        fs.existsSync("monitoring/alerts.yml")
    );

});

