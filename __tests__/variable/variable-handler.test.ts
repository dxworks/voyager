import {
    environmentContext,
    instrumentActionEnvProvider,
    missionEnvProvider,
} from '../utils/environment-variables.utils'
import {
    cleanVariableHandler,
    getCustomEnvHandler,
    getCustomParametersHandler,
    getDefaultVariableHandler,
    mapsAreEqual,
} from '../utils/variables-provider.utils'
import {
    instrumentActionParameterProvider,
    maxHeapParameterContext,
    missionActionParameterProvider,
    placeParameterContext,
} from '../utils/parameters-variables.utils'


describe('testing getting environments variables from context', () => {
    afterEach(() => {
        cleanVariableHandler()
    })
    test('default handler should pass', () => {
        const actualEnvironments = getDefaultVariableHandler().getEnvironmentVariables(environmentContext)
        const expectedEnvironments = new Map([['test', '10'], ['missionCommand', '10'], ['missionAction', '9'], ['mission', '8'], ['instrumentCommand', '7'], ['instrumentAction', '6']])
        expect(mapsAreEqual(actualEnvironments, expectedEnvironments)).toBe(true)
    })
    test('custom handler should pass', () => {
        const actualEnvironments = getCustomEnvHandler(missionEnvProvider, instrumentActionEnvProvider).getEnvironmentVariables(environmentContext)
        const expectedEnvironments = new Map([['test', '8'], ['mission', '8'], ['instrumentAction', '6']])
        expect(mapsAreEqual(actualEnvironments, expectedEnvironments)).toBe(true)
    })
    test('empty handler should pass', () => {
        const actualEnvironments = getCustomEnvHandler().getEnvironmentVariables(environmentContext)
        const expectedEnvironments = new Map()
        expect(mapsAreEqual(actualEnvironments, expectedEnvironments)).toBe(true)
    })
})

describe('testing getting parameter value from context', () => {
    afterEach(() => {
        cleanVariableHandler()
    })
    test('default handler should pass', () => {
        const variableHandler = getDefaultVariableHandler()
        let actualParameter = variableHandler.getParameter(placeParameterContext)
        let expectedParameter = 'missionCommand'
        expect(actualParameter).toBe(expectedParameter)
        actualParameter = variableHandler.getParameter(maxHeapParameterContext)
        expectedParameter = '10g'
        expect(actualParameter).toBe(expectedParameter)
    })
    test('custom handler should pass', () => {
        const variableHandler = getCustomParametersHandler(missionActionParameterProvider, instrumentActionParameterProvider)
        let actualParameter = variableHandler.getParameter(placeParameterContext)
        let expectedParameter = 'missionAction'
        expect(actualParameter).toBe(expectedParameter)
        actualParameter = variableHandler.getParameter(maxHeapParameterContext)
        expectedParameter = '9g'
        expect(actualParameter).toBe(expectedParameter)
    })
    test('empty handler should pass', () => {
        const variableHandler = getCustomParametersHandler()
        let actualParameter = variableHandler.getParameter(placeParameterContext)
        let expectedParameter = null
        expect(actualParameter).toBe(expectedParameter)
        actualParameter = variableHandler.getParameter(maxHeapParameterContext)
        expectedParameter = null
        expect(actualParameter).toBe(expectedParameter)
    })
})

