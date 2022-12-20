import {Mission} from './Mission'
import {Instrument} from './Instrument'

export interface MissionContext {
    mission: Mission;
    instruments: Instrument[];
}