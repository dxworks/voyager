import {CommandContext} from './Command'

export interface Action {
    name: string
}

export interface CustomAction extends Action {
    commandsContext: CommandContext[];
}

export interface DefaultAction extends Action {
    with: WithAction;
}

export interface WithAction {
    locations?: Location[]
    script?: string
    validExitCodes?: number[]

}

export interface Location {
    source: string,
    destination: string,
    files: string[],
}

export function instanceOfDefaultAction(object: any): boolean{
    return 'with' in object
}

