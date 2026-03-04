const runMissionMock = jest.fn(() => Promise.resolve())
const findAndRunMissionMock = jest.fn(() => Promise.resolve())
const cleanMissionMock = jest.fn(() => Promise.resolve())
const verifyMissionMock = jest.fn(() => Promise.resolve())
const packMissionMock = jest.fn()
const unpackMissionMock = jest.fn()
const summaryMissionMock = jest.fn(() => Promise.resolve())

jest.mock('../src/runner/mission-runner', () => ({
    runMission: runMissionMock,
    findAndRunMission: findAndRunMissionMock,
    cleanMission: cleanMissionMock,
    verifyMission: verifyMissionMock,
    packMission: packMissionMock,
    unpackMission: unpackMissionMock,
    summaryMission: summaryMissionMock,
}))

function executeCli(args: string[]): void {
    const initialArgv = process.argv
    process.argv = ['node', 'voyager', ...args]
    jest.isolateModules(() => {
        require('../src/voyager')
    })
    process.argv = initialArgv
}

describe('voyager cli wiring', () => {
    beforeEach(() => {
        runMissionMock.mockClear()
        findAndRunMissionMock.mockClear()
        cleanMissionMock.mockClear()
        verifyMissionMock.mockClear()
        packMissionMock.mockClear()
        unpackMissionMock.mockClear()
        summaryMissionMock.mockClear()
    })

    test('run with missionPath should call runMission with mission path and actions', () => {
        executeCli(['run', '--missionPath', './mission.yml', '--actions', 'verify', 'summary'])

        expect(runMissionMock).toHaveBeenCalledWith('./mission.yml', ['verify', 'summary'])
        expect(findAndRunMissionMock).not.toHaveBeenCalled()
    })

    test('run without missionPath should call findAndRunMission', () => {
        executeCli(['run', '--actions', 'verify'])

        expect(findAndRunMissionMock).toHaveBeenCalledWith(['verify'])
        expect(runMissionMock).not.toHaveBeenCalled()
    })

    test('clean command should dispatch to cleanMission', () => {
        executeCli(['clean', '--missionPath', './mission.yml'])

        expect(cleanMissionMock).toHaveBeenCalledWith('./mission.yml')
    })

    test('pack and unpack commands should dispatch to their mission-runner handlers', () => {
        executeCli(['pack', '--missionPath', './mission.yml'])
        executeCli(['unpack', '--missionPath', './mission.yml'])

        expect(packMissionMock).toHaveBeenCalledWith('./mission.yml')
        expect(unpackMissionMock).toHaveBeenCalledWith('./mission.yml')
    })

    test('summary command should dispatch to summaryMission', () => {
        executeCli(['summary', '--missionPath', './mission.yml'])

        expect(summaryMissionMock).toHaveBeenCalledWith('./mission.yml')
    })

    test('verify command should dispatch to verifyMission using current wiring', () => {
        executeCli(['verify', './mission.yml'])

        expect(verifyMissionMock).toHaveBeenCalled()
    })
})
