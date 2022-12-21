export interface VariableContext {
    instrumentKey?: string;
    actionKey?: string;
    commandKey?: string;
    variableKey: string
}

export interface Variable extends VariableContext {
    value: Map<string, string>;
}