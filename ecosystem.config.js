module.exports = {
    apps: [
        {
            name: "Softphone_UAT",
            script: "server.js",
            instances: 1,
            exec_mode: "fork"
        }
    ]
}