#!/usr/bin/env node

const currentNodeVersion = process.versions.node.split('.')[0];
if (currentNodeVersion < 4) {
  console.error('spreedly-fingerprint-manager requires Node 4 or higher');
}

require('dotenv').config();
require('./app');
