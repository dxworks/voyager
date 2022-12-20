export class CommandVariablesProvider {
    private variables: Map<string, Map<string, Map<string, string>>> = new Map()

    public setVariable(instrumentKey: string, actionKey: string, commandKey: string, value: string): void {
        const instrumentMap = this.variables.get(instrumentKey)
        if (instrumentMap) {
            const actionMap = instrumentMap.get(actionKey)
            if (actionMap)
                actionMap.set(commandKey, value)
            else
                instrumentMap.set(actionKey, new Map([[commandKey, value]]))
        } else
            this.variables.set(instrumentKey, new Map([[actionKey, new Map([[commandKey, value]])]]))
    }

    public getVariable(instrumentKey: string, actionKey: string, commandKey: string): string | null {
        const instrumentMap = this.variables.get(instrumentKey)
        if (instrumentMap) {
            const actionMap = instrumentMap.get(actionKey)
            if (actionMap) {
                const value = actionMap.get(commandKey)
                if (value)
                    return value
                else
                    return null
            }
        }
        return null
    }
}