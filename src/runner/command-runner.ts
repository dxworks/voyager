import {exec} from 'child_process'
import {Command, CommandContext, instanceOfCommand} from '../model/Command'
import {osType} from '@dxworks/cli-common'

export function runCommand(commandContext: CommandContext): void {

    if (!instanceOfCommand(commandContext.command)) {
        executeCommand(<string>commandContext.command)
    } else {
        const command = <Command>commandContext.command
        switch (osType) {
            case 'windows':
                if (command.windows)
                    executeCommand(command.windows)
                break
            case 'linux':
                if (command.linux) {
                    executeCommand(command.linux)
                    break
                }
                if (command.unix)
                    executeCommand(command.unix)
                break
            case 'mac':
                if (command.mac) {
                    executeCommand(command.mac)
                    break
                }
                if (command.unix)
                    executeCommand(command.unix)
                break
        }
    }
}

function executeCommand(command: string): void {
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