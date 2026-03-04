import {missionContext} from '../../../src/context/MissionContext'
import {DefaultAction} from '../../../src/model/Action'
import {verifyActionKey} from '../../../src/runner/action-utils'
import {runVerifyAction, runVerifyActionsAndGetReport} from '../../../src/runner/default-actions/verify-action-runner'
import {resetMissionContext} from '../../utils/mission-context.utils'

describe('verify action runner', () => {
    beforeEach(() => {
        resetMissionContext()
    })

    afterEach(() => {
        resetMissionContext()
    })

    test('should pass requirement when extracted version is above minimum', async () => {
        await runVerifyAction(<DefaultAction>{
            name: 'verify',
            with: {
                requirements: [{
                    name: 'node',
                    min: '1.0.0',
                    match: ['(?<version>.+)'],
                    command: 'node -e "console.log(\'1.2.0\')"',
                }],
            },
        }, 'Tool')

        const report = missionContext.doctorReport.instrumentsDoctorReport[0]
        expect(report.requirementsByName.get('node')).toBe(true)
    })

    test('should fail requirement when extracted version is below minimum', async () => {
        await runVerifyAction(<DefaultAction>{
            name: 'verify',
            with: {
                requirements: [{
                    name: 'node',
                    min: '3.0.0',
                    match: ['(?<version>.+)'],
                    command: 'node -e "console.log(\'1.2.0\')"',
                }],
            },
        }, 'Tool')

        const report = missionContext.doctorReport.instrumentsDoctorReport[0]
        expect(report.requirementsByName.get('node')).toBe(false)
    })

    test('runVerifyActionsAndGetReport should process all instruments with verify action', async () => {
        const verifyAction = <DefaultAction>{
            name: verifyActionKey,
            with: {
                requirements: [{
                    name: 'node',
                    min: '1.0.0',
                    match: ['(?<version>.+)'],
                    command: 'node -e "console.log(\'2.0.0\')"',
                }],
            },
        }
        missionContext.instruments = [
            {
                id: 'one',
                name: 'First',
                version: '1.0.0',
                instrumentPath: '.',
                runOrder: 0,
                actions: new Map([[verifyActionKey, verifyAction]]),
            },
            {
                id: 'two',
                name: 'Second',
                version: '1.0.0',
                instrumentPath: '.',
                runOrder: 1,
                actions: new Map(),
            },
        ]

        await runVerifyActionsAndGetReport()

        expect(missionContext.doctorReport.instrumentsDoctorReport.length).toBe(1)
        expect(missionContext.doctorReport.instrumentsDoctorReport[0].instrumentName).toBe('First')
    })
})
