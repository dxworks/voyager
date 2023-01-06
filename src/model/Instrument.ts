import {Action} from './Action'

export interface Instrument {
    id: string;
    name: string;
    version: string;
    actions: Action[];
    results: Results
}

export interface Results {
    dir?: string
    files?: string[]
}