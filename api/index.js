// Vercel Serverless Function Entry Point for CHILLMODE
const backend = require('../backend/dist/index.js');
const app = backend.default || backend;

module.exports = (req, res) => {
  return app(req, res);
};
