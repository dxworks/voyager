export interface ArchiveFileCall {
    filePath: string
    name: string
}

export interface ArchiveDirectoryCall {
    sourcePath: string
    destination: string
}

export class FakeArchive {
    readonly files: ArchiveFileCall[] = []
    readonly directories: ArchiveDirectoryCall[] = []

    file(filePath: string, options: { name: string }): void {
        this.files.push({filePath, name: options.name})
    }

    directory(sourcePath: string, destination: string): void {
        this.directories.push({sourcePath, destination})
    }
}
