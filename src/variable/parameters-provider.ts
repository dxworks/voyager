import {Variable} from '../model/Variable'

export class ParametersProvider {
    private variables: Variable[] = []

    public addVariables(...environments: Variable[]): void {
        this.variables.push(...environments)
    }

    public getVariables(): Variable[] {
        return this.variables
    }
}