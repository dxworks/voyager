import {exec} from 'child_process'
import {CommandContext} from '../model/Command'
import {osType} from '@dxworks/cli-common'

export function runCommand(commandContext: CommandContext): void {

    if (commandContext.command.universalCommand) {
        executeCommand(commandContext.command.universalCommand)
    }
    switch (osType) {
        case 'windows':
            if (commandContext.command.windows)
                executeCommand(commandContext.command.windows)
            break
        case 'linux':
            if (commandContext.command.linux) {
                executeCommand(commandContext.command.linux)
                break
            }
            if (commandContext.command.unix)
                executeCommand(commandContext.command.unix)
            break
        case 'mac':
            if (commandContext.command.mac) {
                executeCommand(commandContext.command.mac)
                break
            }
            if (commandContext.command.unix)
                executeCommand(commandContext.command.unix)
            break
    }
}

function executeCommand(command:string): void {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`)
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
            return
        }
        console.log(`stdout: ${stdout}`)
    })
}