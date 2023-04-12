import {CommandContext} from './Command'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Action {

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

