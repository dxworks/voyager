import {VariableProvider} from '../../src/variable/VariableProvider'

export const placeParameterContext = {
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'place',
}

export const maxHeapParameterContext = {
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'max-heap',
}
export const missionCommandParameterProvider = new VariableProvider([{
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'max-heap',
    value: '10g',
}, {
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'place',
    value: 'missionCommand',
}])

export const missionActionParameterProvider = new VariableProvider([{
    instrumentKey: 'test',
    actionKey: 'custom',
    variableKey: 'max-heap',
    value: '9g',
}, {
    instrumentKey: 'test',
    actionKey: 'custom',
    variableKey: 'place',
    value: 'missionAction',
}])


export const instrumentCommandParameterProvider = new VariableProvider([{
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'max-heap',
    value: '7g',
}, {
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
    variableKey: 'max-heap',
    value: 'instrumentCommand',
}])

export const instrumentActionParameterProvider = new VariableProvider([{
    instrumentKey: 'test',
    actionKey: 'custom',
    variableKey: 'max-heap',
    value: '6g',
}, {
    instrumentKey: 'test',
    actionKey: 'custom',
    variableKey: 'max-heap',
    value: 'instrumentAction',
}])