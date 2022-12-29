import {ParametersProvider} from '../../src/variable/parameters-provider'

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
export const missionCommandParameterProvider = new ParametersProvider([{
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

export const missionActionParameterProvider = new ParametersProvider([{
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


export const instrumentCommandParameterProvider = new ParametersProvider([{
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

export const instrumentActionParameterProvider = new ParametersProvider([{
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