import {VariableProvider} from '../../src/variable/VariableProvider'

export const environmentContext = {
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
}

export const missionCommandEnvProvider = new VariableProvider([{
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'test',
    value: '10',
}, {
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'missionCommand',
    value: '10',
}])

export const missionActionEnvProvider = new VariableProvider([{
    instrumentKey: 'test',
    actionKey: 'custom',
    variableKey: 'test',
    value: '9',
}, {instrumentKey: 'test', actionKey: 'custom', variableKey: 'missionAction', value: '9'}])

export const missionEnvProvider = new VariableProvider([{variableKey: 'test', value: '8'}, {
    variableKey: 'mission',
    value: '8',
}])

export const instrumentCommandEnvProvider = new VariableProvider([{
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'test',
    value: '7',
}, {
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'instrumentCommand',
    value: '7',
}])

export const instrumentActionEnvProvider = new VariableProvider([{
    instrumentKey: 'test',
    actionKey: 'custom',
    variableKey: 'test',
    value: '6',
}, {instrumentKey: 'test', actionKey: 'custom', variableKey: 'instrumentAction', value: '6'}])