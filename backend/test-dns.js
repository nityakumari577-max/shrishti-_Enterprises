const dns = require("dns");

dns.setServers(["8.8.8.8"]);

dns.resolveSrv(
    "_mongodb._tcp.cluster0.enta12r.mongodb.net",
    (err, addresses) => {
        if (err) {
            console.error("DNS ERROR:", err);
        } else {
            console.log("DNS WORKING:");
            console.log(addresses);
        }
    }
);