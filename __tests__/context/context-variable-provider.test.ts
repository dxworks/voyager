import {ContextVariableProvider} from '../../src/context/context-variable-provider'

describe('context variable provider', () => {
    test('addVariable and getVariable should return stored value', () => {
        const provider = new ContextVariableProvider()

        provider.addVariable('k1', 'v1')

        expect(provider.getVariable('k1')).toBe('v1')
    })

    test('getVariable should return null for missing key', () => {
        const provider = new ContextVariableProvider()

        expect(provider.getVariable('missing')).toBe(null)
    })

    test('addVariable should overwrite existing key', () => {
        const provider = new ContextVariableProvider()

        provider.addVariable('k1', 'v1')
        provider.addVariable('k1', 'v2')

        expect(provider.getVariable('k1')).toBe('v2')
    })
})
