export interface VariableContext {
    instrumentKey?: string;
    actionKey?: string;
    commandKey?: string;
}

export interface ExtendedVariableContext extends VariableContext {
    variableKey: string
}

export interface Variable extends ExtendedVariableContext {
    value: string;
}