export class UnpackMapping {
    private _unpackMapping: Map<string, UnpackElement[]> = new Map()


    get unpackMapping(): Map<string, UnpackElement[]> {
        return this._unpackMapping
    }

    set unpackMapping(value: Map<string, UnpackElement[]>) {
        this._unpackMapping = value
    }

    public getInstrumentMapping(instrumentKey: string): UnpackElement[] {
        return this._unpackMapping.has(instrumentKey) ? <UnpackElement[]>this._unpackMapping.get(instrumentKey) : []
    }

    public addMappingElement(instrumentKey: string, key: string, destination: string, prefix: string): void {
        const unpackElement = new UnpackElement(key, destination, prefix)
        if (this._unpackMapping.has(instrumentKey)) {
            this._unpackMapping.get(instrumentKey)?.push(unpackElement)
        } else {
            this._unpackMapping.set(instrumentKey, [unpackElement])
        }
    }

    public isEmpty(): boolean {
        return this._unpackMapping.size === 0
    }
}

export class UnpackElement {

    private _fileId = ''
    private _destination = ''
    private _prefix = ''


    constructor(fileId: string, destination: string, prefix: string) {
        this._fileId = fileId
        this._destination = destination
        this._prefix = prefix
    }


    get fileId(): string {
        return this._fileId
    }

    set fileId(value: string) {
        this._fileId = value
    }

    get destination(): string {
        return this._destination
    }

    set destination(value: string) {
        this._destination = value
    }

    get prefix(): string {
        return this._prefix
    }

    set prefix(value: string) {
        this._prefix = value
    }
}