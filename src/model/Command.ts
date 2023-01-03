export interface CommandContext {
    id: string;
    environment?: Map<string, string>;
    command: string | Command;
    with?: WithActions
}

export interface Command {
    windows?: string;
    unix?: string;
    mac?: string;
    linux?: string;
}

export interface WithActions {
    locations?: string[]
    script?: string
    validExitCodes?: number[]

}

export function instanceOfCommand(object: any): boolean {
    return 'windows' in object || 'unix' in object || 'mac' in object || 'linux' in object
}