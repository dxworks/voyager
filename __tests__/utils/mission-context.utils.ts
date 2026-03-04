import {missionContext} from '../../src/context/MissionContext'
import {
    missionActionEnvVarProvider,
    missionActionVarProvider,
    missionCommandEnvVarProvider,
    missionCommandVarProvider,
    missionEnvVarProvider,
} from '../../src/context/mission-variable-providers'
import {VariableProvider} from '../../src/variable/VariableProvider'

function clearProvider(provider: VariableProvider): void {
    provider.getVariables().splice(0)
}

export function resetMissionContext(): void {
    if (missionContext.logsStream)
        missionContext.logsStream.close()

    const missionContextAny = <any>missionContext
    missionContextAny._name = ''
    missionContextAny._instruments = []
    missionContextAny._runnableInstruments = []
    missionContextAny._targets = []
    missionContextAny._missionNameInZipFile = false
    missionContextAny._logsStream = null
    missionContextAny.runAll = true

    missionContext.missionSummary.missionName = ''
    missionContext.missionSummary.runningTime = ''
    missionContext.missionSummary.instrumentsSummary.clear()
    missionContext.doctorReport.instrumentsDoctorReport.splice(0)
    missionContext.unpackMapping.unpackMapping.clear()

    missionContextAny.variableProvider.variables.clear()

    clearProvider(missionCommandVarProvider)
    clearProvider(missionActionVarProvider)
    clearProvider(missionCommandEnvVarProvider)
    clearProvider(missionActionEnvVarProvider)
    clearProvider(missionEnvVarProvider)
}
