#!/usr/bin/env node
import {
    cleanMission,
    findAndRunMission,
    packMission,
    runMission,
    summaryMission,
    unpackMission,
    verifyMission,
} from './runner/mission-runner'
import {program} from 'commander'

program
    .command('run')
    .description('Run mission')
    .option('-m, --missionPath <missionPath>')
    .option('-a, --actions <actions...>', 'Actions to run from the mission')
    .option('-v, --verbose', 'Show full command details')
    .action((options: { missionPath?: string, actions?: string[], verbose?: boolean }) => {
        if (options.missionPath) {
            if (options.verbose)
                runMission(options.missionPath, options.actions, true).then()
            else
                runMission(options.missionPath, options.actions).then()
        } else {
            if (options.verbose)
                findAndRunMission(options?.actions, true).then()
            else
                findAndRunMission(options?.actions).then()
        }
    })

program
    .command('clean')
    .description('Clean mission instruments')
    .option('-m, --missionPath <missionPath>')
    .option('-v, --verbose', 'Show full command details')
    .action((options: { missionPath?: string, verbose?: boolean }) => {
        if (options.verbose)
            cleanMission(options.missionPath, true).then()
        else
            cleanMission(options.missionPath).then()
    })

program
    .command('verify [missionPath]')
    .description('Verify mission instruments requirements')
    .option('-m, --missionPath <missionPath>')
    .option('-v, --verbose', 'Show full command details')
    .action((missionPath: string | undefined, options: { missionPath?: string, verbose?: boolean }) => {
        if (options.verbose)
            verifyMission(options.missionPath ?? missionPath, true).then()
        else
            verifyMission(options.missionPath ?? missionPath).then()
    })

program
    .command('pack')
    .description('Pack mission results')
    .option('-m, --missionPath <missionPath>')
    .option('-v, --verbose', 'Show full command details')
    .action((options: { missionPath?: string, verbose?: boolean }) => {
        if (options.verbose)
            packMission(options.missionPath, true)
        else
            packMission(options.missionPath)
    })

program
    .command('unpack')
    .description('Unpack mission results archive')
    .option('-m, --missionPath <missionPath>')
    .option('-v, --verbose', 'Show full command details')
    .action((options: { missionPath?: string, verbose?: boolean }) => {
        if (options.verbose)
            unpackMission(options.missionPath, true)
        else
            unpackMission(options.missionPath)
    })

program
    .command('summary')
    .description('Run summary actions for mission instruments')
    .option('-m, --missionPath <missionPath>')
    .option('-v, --verbose', 'Show full command details for summary actions')
    .action((options: { missionPath?: string, verbose?: boolean }) => {
        summaryMission(options.missionPath, !!options.verbose).then()
    })

program.version("0.0.1")

program.parse(process.argv)
