import {VariableProvider} from '../../src/variable/VariableProvider'

describe('variable provider', () => {
    test('constructor should keep initial variables', () => {
        const provider = new VariableProvider([
            {
                instrumentKey: 'tool',
                actionKey: 'start',
                variableKey: 'threads',
                value: '8',
            },
        ])

        expect(provider.getVariables().length).toBe(1)
        expect(provider.getVariables()[0].variableKey).toBe('threads')
    })

    test('addVariables should append entries in insertion order', () => {
        const provider = new VariableProvider()

        provider.addVariables({variableKey: 'first', value: '1'})
        provider.addVariables({variableKey: 'second', value: '2'})

        expect(provider.getVariables().map(variable => variable.variableKey)).toEqual(['first', 'second'])
    })
})
