import {UnpackElement, UnpackMapping} from '../../src/model/UnpackMapping'

describe('unpack mapping', () => {
    test('isEmpty should be true initially and false after add', () => {
        const mapping = new UnpackMapping()

        expect(mapping.isEmpty()).toBe(true)

        mapping.addMappingElement('tool', 'id1', './dest', 'prefix')
        expect(mapping.isEmpty()).toBe(false)
    })

    test('addMappingElement should append entries for existing instrument', () => {
        const mapping = new UnpackMapping()

        mapping.addMappingElement('tool', 'id1', './dest1', 'p1')
        mapping.addMappingElement('tool', 'id2', './dest2', 'p2')

        const instrumentMapping = mapping.getInstrumentMapping('tool')
        expect(instrumentMapping.length).toBe(2)
        expect(instrumentMapping[0].fileId).toBe('id1')
        expect(instrumentMapping[1].fileId).toBe('id2')
    })

    test('getInstrumentMapping should return empty list for unknown instrument', () => {
        const mapping = new UnpackMapping()

        expect(mapping.getInstrumentMapping('missing')).toEqual([])
    })

    test('unpackMapping getter and setter should roundtrip', () => {
        const mapping = new UnpackMapping()
        const map = new Map<string, UnpackElement[]>()
        map.set('tool', [new UnpackElement('id1', './out', 'prefix')])

        mapping.unpackMapping = map

        expect(mapping.unpackMapping.get('tool')!.length).toBe(1)
        expect(mapping.unpackMapping.get('tool')![0].destination).toBe('./out')
    })
})
