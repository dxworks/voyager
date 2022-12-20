import {CommandContext} from './Command'

export interface BaseAction {
    id: string;
    commandsContext: CommandContext[];
    parameters?: Map<string, string>;
    environment?: Map<string, string>;
}

export interface Action extends BaseAction {
    produces?: Map<string, string>;
}
