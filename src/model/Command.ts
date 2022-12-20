export interface CommandContext {
    id: string;
    environment?: Map<string, string>;
    command: string | Command;

}

export interface Command {
    windows?: string;
    unix?: string;
    mac?: string;
    linux?: string;
}

export function instanceOfCommand(object: any): boolean {
    return 'windows' in object || 'unix' in object || 'mac' in object || 'linux' in object
}