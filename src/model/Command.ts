export interface CommandContext {
    id: string;
    name: string;
    parameters?: Map<string, string>;
    environment?: Map<string, string>;
    command: Command;

}

interface Command {
    universalCommand?: string;
    windows?: string;
    unix?: string;
    mac?: string;
    linux?: string;
}