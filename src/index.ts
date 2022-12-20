#!/usr/bin/env node

import path from 'node:path'
import {loadAndParseData} from './parser/data-parser'

loadAndParseData('C:\\Users\\noprut\\voyager2\\unpack-mission.yml')

console.log(path.resolve('C:\\Users\\noprut\\voyager2', './instruments', 'instrument.yml'))