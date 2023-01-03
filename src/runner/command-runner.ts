import {execSync} from 'child_process'
import {Command, CommandContext, instanceOfCommand} from '../model/Command'
import {osType} from '@dxworks/cli-common'

export function runCommand(commandContext: CommandContext): void {
    const env = createEnv(commandContext.environment)
    if (typeof commandContext.command == 'string') {
        executeCommand(<string>commandContext.command, env)
    } else if (instanceOfCommand(commandContext.command)) {
        executeCommand(translateCommand(<Command>commandContext.command), env)
    }
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
    const env = process.env
    environmentVariables?.forEach((value, key) => env[key] = value)
    return env
}

function executeCommand(command: string | undefined, env: NodeJS.ProcessEnv): void {
    if (!command) {
        console.warn('warn: No command defined for platform')
        return
    }
    try {
        execSync(command, {env: env, stdio: 'inherit'}) // TODO:stdio check what you need
    } catch (error: any) {
        console.log(`error: ${error.message}`)
    }

}