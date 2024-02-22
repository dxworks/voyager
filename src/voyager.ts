#!/usr/bin/env node
import {
    cleanMission,
    findAndRunMission,
    openSummary,
    packMission,
    runMission,
    unpackMission,
    verifyMission,
} from './runner/mission-runner'
import {program} from 'commander'

program
    .command('run')
    .description('Run mission')
    .option('-m, --missionPath <missionPath>')
    .option('-a, --actions <actions...>', 'Actions to run from the mission')
    .action((options: { missionPath?: string, actions?: string[] }) => {
        if (options.missionPath)
            runMission(options.missionPath, options.actions).then()
        else
            findAndRunMission(options?.actions).then()
    })

program
    .command('clean')
    .description('Clean mission instruments')
    .option('-m, --missionPath <missionPath>')
    .action((options: { missionPath?: string }) => {
        cleanMission(options.missionPath).then()
    })

program
    .command('verify <missionPath>')
    .description('Verify mission instruments requirements')
    .option('-m, --missionPath')
    .action((options: { missionPath?: string }) => {
        verifyMission(options.missionPath).then()
    })

program
    .command('pack')
    .description('Pack mission results')
    .option('-m, --missionPath <missionPath>')
    .action((options: { missionPath?: string }) => {
        packMission(options.missionPath)
    })

program
    .command('unpack')
    .description('Unpack mission results archive')
    .option('-m, --missionPath <missionPath>')
    .action((options: { missionPath?: string }) => {
        unpackMission(options.missionPath)
    })

program
    .command('summary')
    .description('Opens the mission summary from the archive')
    .requiredOption('-z, --zipPath <zipPath>')
    .option('-l, --legacy', 'Use legacy summary')
    .action((options: { zipPath: string, legacy?: boolean }) => {
        openSummary(options.zipPath, !!options.legacy)
    })

program.parse(process.argv)
