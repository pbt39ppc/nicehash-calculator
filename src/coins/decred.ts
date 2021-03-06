import { Hash } from "../hash";
import { Algorithms } from "../algorithms";

export var coin = {
  name: "Decred",
  names: [
    "dcr", "decred", "dual",
  ],
  NiceHash: {
    hashrate: Hash.TERA,
    id: Algorithms.Decred,
  },
  WhatToMine: {
    hashrate: 1000 * 1000,
    id: 152,
  },
  enabled: false,
};
