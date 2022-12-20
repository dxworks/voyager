import {Instrument} from './Instrument'
import {Action} from './Action'

export interface InstrumentContext {
    instrument: Instrument;
    actions: Action[];
}