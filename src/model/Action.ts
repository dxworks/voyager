import {Command, CommandContext} from './Command'

export interface Action {
    name: string
    commandsContext?: CommandContext[];
}

export interface DefaultAction extends Action {
    with?: WithAction;
    produces?: Map<string, string>
}

export interface WithAction {
    locations?: Location[]
    script?: string
    validExitCodes?: number[]
    requirements?: Requirement[]
}

export interface Location {
    rmDir?: boolean
    source: string,
    destination: string,
    files: string[],
}

export interface Requirement {
    name: string
    min: string
    match: string[]
    command: string | Command
}

export function instanceOfDefaultAction(object: any): boolean {
    return 'with' in object
}

