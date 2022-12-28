import {cleanVariableHandler, getCustomHandler, getDefaultVariableHandler, mapsAreEqual} from '../utils/variable-utils'


const environmentContext = {
    instrumentKey: 'test',
    actionKey: 'custom',
    commandKey: 'hello',
}
describe('testing getting environments variables for context', () => {
    afterEach(() => {
        cleanVariableHandler()
    })
    test('default handler should pass', () => {
        const actualEnvironments = getDefaultVariableHandler().getEnvironmentVariables(environmentContext)
        const expectedEnvironments = new Map([['test', '10'], ['missionCommand', '10'], ['missionAction', '9'], ['mission', '8'], ['instrumentCommand', '7'], ['instrumentAction', '6']])
        expect(mapsAreEqual(actualEnvironments, expectedEnvironments)).toBe(true)
    })
    test('empty handler should pass', () => {
        const actualEnvironments = getCustomHandler().getEnvironmentVariables(environmentContext)
        const expectedEnvironments = new Map()
        expect(mapsAreEqual(actualEnvironments, expectedEnvironments)).toBe(true)
    })
})

