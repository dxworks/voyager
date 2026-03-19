import {instanceOfDefaultAction} from '../../src/model/Action'
import {instanceOfCommand} from '../../src/model/Command'

describe('model type guards', () => {
    test('instanceOfDefaultAction should return true when with exists', () => {
        expect(instanceOfDefaultAction({name: 'pack', with: {}})).toBe(true)
    })

    test('instanceOfDefaultAction should return false when with is missing', () => {
        expect(instanceOfDefaultAction({name: 'start'})).toBe(false)
    })

    test('instanceOfDefaultAction should return false for undefined', () => {
        expect(instanceOfDefaultAction(undefined)).toBe(false)
    })

    test('instanceOfCommand should return true for command object keys', () => {
        expect(instanceOfCommand({windows: 'cmd /c echo ok'})).toBe(true)
        expect(instanceOfCommand({unix: 'echo ok'})).toBe(true)
        expect(instanceOfCommand({mac: 'echo ok'})).toBe(true)
        expect(instanceOfCommand({linux: 'echo ok'})).toBe(true)
    })

    test('instanceOfCommand should return false for non command object', () => {
        expect(instanceOfCommand({name: 'start'})).toBe(false)
    })
})
