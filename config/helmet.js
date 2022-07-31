// Configuration for the helmet middleware that sets security related HTTP Headers

const helmetOptions = {
  frameguard: { action: "deny" },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  contentSecurityPolicy: { directives: { frameAncestors: ["'none'"] } }
};

module.exports = helmetOptions;