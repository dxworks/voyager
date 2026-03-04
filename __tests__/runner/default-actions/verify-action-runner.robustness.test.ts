import {DefaultAction} from '../../../src/model/Action'
import {runVerifyAction} from '../../../src/runner/default-actions/verify-action-runner'
import {resetMissionContext} from '../../utils/mission-context.utils'
import {missionContext} from '../../../src/context/MissionContext'

describe('verify action runner robustness', () => {
    beforeEach(() => {
        resetMissionContext()
    })

    afterEach(() => {
        resetMissionContext()
    })

    test('requirement should pass when one of multiple regex patterns matches', async () => {
        await runVerifyAction(<DefaultAction>{
            name: 'verify',
            with: {
                requirements: [
                    {
                        name: 'multi-match',
                        min: '1.0.0',
                        match: ['^v(?<version>.+)$', '(?<version>.+)'],
                        command: 'node -e "console.log(\'2.0.0\')"',
                    },
                ],
            },
        }, 'Tool')

        const report = missionContext.doctorReport.instrumentsDoctorReport[0]
        expect(report.requirementsByName.get('multi-match')).toBe(true)
    })

    test('verify should support platform command objects for requirement commands', async () => {
        await runVerifyAction(<DefaultAction>{
            name: 'verify',
            with: {
                requirements: [
                    {
                        name: 'platform-command',
                        min: '1.0.0',
                        match: ['(?<version>.+)'],
                        command: {
                            windows: 'node -e "console.log(\'2.0.0\')"',
                            unix: 'node -e "console.log(\'2.0.0\')"',
                            linux: 'node -e "console.log(\'2.0.0\')"',
                            mac: 'node -e "console.log(\'2.0.0\')"',
                        },
                    },
                ],
            },
        }, 'Tool')

        const report = missionContext.doctorReport.instrumentsDoctorReport[0]
        expect(report.requirementsByName.get('platform-command')).toBe(true)
    })

    test('failed requirement should not stop evaluation of following requirements', async () => {
        await runVerifyAction(<DefaultAction>{
            name: 'verify',
            with: {
                requirements: [
                    {
                        name: 'first-fails',
                        min: '10.0.0',
                        match: ['(?<version>.+)'],
                        command: 'node -e "console.log(\'2.0.0\')"',
                    },
                    {
                        name: 'second-passes',
                        min: '1.0.0',
                        match: ['(?<version>.+)'],
                        command: 'node -e "console.log(\'2.0.0\')"',
                    },
                ],
            },
        }, 'Tool')

        const report = missionContext.doctorReport.instrumentsDoctorReport[0]
        expect(report.requirementsByName.get('first-fails')).toBe(false)
        expect(report.requirementsByName.get('second-passes')).toBe(true)
    })
})
