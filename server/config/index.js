const nconf = require("nconf");

const { NODE_ENV } = process.env;

const nconfProvider = nconf;

nconfProvider.env("__");

if (process.env.NODE_ENV === "dev") {
  nconfProvider.file("userConfig", `${__dirname}/user.json`);
}

nconfProvider.file("envConfig", `${__dirname}/${NODE_ENV}.json`);
nconfProvider.file("defaultConfig", `${__dirname}/default.json`);

const config = nconf.get();

module.exports = config;
