export interface CommandContext {
    id: string;
    environment?: Map<string, string>;
    command: string | Command;

}

interface Command {
    windows?: string;
    unix?: string;
    mac?: string;
    linux?: string;
}