import {exec} from 'child_process'
import {Command, CommandContext, instanceOfCommand} from '../model/Command'
import {osType} from '@dxworks/cli-common'

export function runCommand(commandContext: CommandContext): void {

    function runWithFallback(initialCommand?: string, fallbackCommand?: string) {
        executeCommand(initialCommand ? initialCommand : fallbackCommand)
    }

    if (!instanceOfCommand(commandContext.command)) {
        executeCommand(<string>commandContext.command)
    } else {
        const command = <Command>commandContext.command
        switch (osType) {
            case 'windows':
                executeCommand(command.windows)
                break
            case 'linux':
                runWithFallback(command.linux, command.unix)
                break
            case 'mac':
                runWithFallback(command.mac, command.unix)
                break
        }
    }
}

function executeCommand(command?: string): void {
    if (!command) {
        console.warn('warn: No command defined for platform')
        return
    }
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