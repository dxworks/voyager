import {execSync} from 'child_process'
import {Command, CommandContext, instanceOfCommand} from '../model/Command'
import {osType} from '@dxworks/cli-common'
import {WithAction} from '../model/Action'

export function runCommand(commandContext: CommandContext, instrumentPath: string): void {
    const env = createEnv(commandContext.environment)
    if (typeof commandContext.command == 'string')
        executeCommand(<string>commandContext.command, env, instrumentPath, commandContext.with)
    else if (instanceOfCommand(commandContext.command))
        executeCommand(translateCommand(<Command>commandContext.command), env, instrumentPath, commandContext.with)
}

function translateCommand(command: Command): string | undefined {
    switch (osType) {
        case 'windows':
            return command.windows
        case 'linux':
            return command.linux ? command.linux : command.unix
        case 'mac':
            return command.mac ? command.mac : command.unix
    }
}

function createEnv(environmentVariables?: Map<string, string>) {
    if (environmentVariables != null && environmentVariables.size != 0) {
        const env = Object.fromEntries(environmentVariables)
        return Object.assign({}, env, process.env)
    } else
        return process.env
}

function executeCommand(command: string | undefined, env: NodeJS.ProcessEnv, path: string, withActions?: WithAction): void {
    if (!command) {
        console.warn('warn: No command defined for platform')
        return
    }
    try {
        execSync(command, {env: env, cwd: path})
    } catch (error: any) {
        if (!withActions?.validExitCodes?.find(error.status))
            console.log(`error: ${error.message}`)
    }
}