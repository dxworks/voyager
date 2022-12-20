export interface VariableContext {
    instrumentKey: string;
    actionKey: string;
    commandKey?: string;
}

export interface Variable extends VariableContext {
    value: Map<string, string>;
}

export function variablesEquals(var1: VariableContext, var2: VariableContext): boolean {
    return var1.instrumentKey == var2.instrumentKey && var1.actionKey == var2.actionKey && var1.commandKey == var2.commandKey
}