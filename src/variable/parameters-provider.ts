import {Variable} from '../model/Variable'

export class ParametersProvider {
    private readonly variables: Variable[] = []


    constructor(variables?: Variable[]) {
        if (variables)
            this.variables = variables
    }

    public addVariables(...variables: Variable[]): void {
        this.variables.push(...variables)
    }

    public getVariables(): Variable[] {
        return this.variables
    }
}