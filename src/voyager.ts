#!/usr/bin/env node
import {cleanMission, runMission, verifyMission} from './runner/mission-runner'
import {program} from 'commander'


program
    .command('run <missionPath>')
    .description('Run mission')
    .option('-a, --actions <actions...>', 'Actions to run from the mission')
    .action((missionPath, options: { actions?: string[] }) => {
        runMission(missionPath, options.actions).then()
    })

program
    .command('clean <missionPath>')
    .description('Clean mission instruments')
    .action((missionPath) => {
        cleanMission(missionPath).then()
    })

program
    .command('verify <missionPath>')
    .description('Verify mission instruments requirements')
    .action((missionPath) => {
        verifyMission(missionPath).then()
    })

program.parse(process.argv)
