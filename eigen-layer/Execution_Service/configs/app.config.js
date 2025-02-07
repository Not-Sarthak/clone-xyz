"use strict";
const env = require("dotenv")
env.config()
const express = require("express")
const app = express()
const cors = require('cors')

// Configure CORS for all domains
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use("/task", require("../src/task.controller"))

module.exports = app