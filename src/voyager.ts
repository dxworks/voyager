#!/usr/bin/env node
import {runMission} from './runner/mission-runner'
import yargs from 'yargs'

const yargsOptions = yargs
    .option('mission-path', {
        alias: 'm',
        describe: 'the full path to the mission',
        type: 'string',
    })
    .demandOption(['mission-path'], 'Please specify the mission path')
    .help(true)
    .argv

console.log('args:')
console.log(yargsOptions.m)

if (yargsOptions._[0] === 'run') {
    runMission(yargsOptions['mission-path'] as string)
} else if (yargsOptions._[0] === 'clean') {
    console.log('Performing clean action')
} else if (yargsOptions._[0] === 'unpack') {
    console.log('Performing unpack action')
} else {
    console.log('Unknown command')
}