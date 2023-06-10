import {DefaultAction, Requirement} from '../../model/Action'
import {Command} from '../../model/Command'
import {translateCommand} from '../command-runner'
import {spawn, SpawnOptions} from 'child_process'
import {parseIntoMap} from '../../parser/data-parser'
import {InstrumentDoctorReport} from '../../model/DoctorReport'
import semver from 'semver/preload'
import {missionContext} from '../../context/MissionContext'
import {verifyActionKey} from '../action-utils'

const regexGroup = /\(\?<(?<group>\w+)>\.\+\)/gm

export async function runVerifyActionsAndGetReport(): Promise<void> {
    for (const instrument of missionContext.instruments) {
        const verifyAction = (<DefaultAction>instrument.actions.get(verifyActionKey))
        if (verifyAction != null)
            await runVerifyAction(verifyAction, instrument.name)
    }
}

export async function runVerifyAction(verifyAction: DefaultAction, instrumentName: string): Promise<void> {
    const requirements = verifyAction.with?.requirements
    const instrumentDoctorReport = new InstrumentDoctorReport(instrumentName)
    if (requirements) {
        for (const requirement of requirements) {
            const command = typeof requirement.command == 'string' ? <string>requirement.command : translateCommand(<Command>requirement.command)
            try {
                await checkRequirement(command!, requirement)
                instrumentDoctorReport.requirementsByName.set(requirement.name, true)
            } catch (err) {
                instrumentDoctorReport.requirementsByName.set(requirement.name, false)
            }
        }
    }
    missionContext.doctorReport.addInstrumentDoctorReport(instrumentDoctorReport)
}

async function checkRequirement(command: string, requirement: Requirement): Promise<void> {
    const options: SpawnOptions = {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
    }
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, options)
        let output = ''

        childProcess.stdout?.on('data', (data) => {
            output = output + data.toString()
        })

        childProcess.stderr?.on('data', (data) => {
            output = output + data.toString()
        })
        childProcess.on('close', () => {
            let fulfilled = false
            for (const regexStr of requirement.match) {
                const groupMach = new RegExp(regexGroup, 'i').exec(regexStr)
                if (groupMach && groupMach.groups && groupMach.groups.group) {
                    const group = groupMach.groups.group
                    const regex = new RegExp(regexStr)  //global RegExp are stateful, so we make sure to use a new state free RegExp
                    const match = regex.exec(output)
                    if (match && match.groups) {
                        const version = String(parseIntoMap(match.groups).get(group))
                        if (semver.gte(version, requirement.min, true))
                            fulfilled = true
                    }
                }
            }
            if (fulfilled)
                resolve()
            else
                reject(new Error())
        })
    })
}


