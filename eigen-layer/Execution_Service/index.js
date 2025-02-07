"use strict";
const app = require("./configs/app.config")
const PORT = process.env.PORT || 4003
const HOST = process.env.HOST || '0.0.0.0'
const dalService = require("./src/dal.service");

dalService.init();
app.listen(PORT, HOST, () => console.log(`Server started on http://${HOST}:${PORT}`))