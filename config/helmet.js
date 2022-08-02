// Configuration for the helmet middleware that sets security related HTTP Headers

const helmetOptions = {
  frameguard: { action: "deny" },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  contentSecurityPolicy: { directives: { frameAncestors: ["'none'"] } }
};

module.exports = helmetOptions;