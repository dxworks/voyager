import {Action} from './Action'

export interface Instrument {
    id: string;
    name: string;
    version: string;
    instrumentPath: string;
    actions: Map<string, Action>;
}