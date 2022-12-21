import {CommandContext} from './Command'

export interface Action {
    id: string;
    commandsContext: CommandContext[];
    produces?: Map<string, string>;
}
