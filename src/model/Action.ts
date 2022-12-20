import {CommandContext} from './Command'

export interface Action {
    id: string;
    commandsContext: CommandContext[];
    environment?: Map<string, string>;
    produces?: Map<string, string>;
}
