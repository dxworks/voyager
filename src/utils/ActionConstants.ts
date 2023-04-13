export const cleanActionKey = 'clean'
export const packageActionKey = 'pack'
export const startActionKey = 'start'
const defaultActionKeys: string[] = [cleanActionKey, packageActionKey]

export function isDefaultAction(actionKey: string): boolean {
    for (let i = 0; i < defaultActionKeys.length; i++)
        if (defaultActionKeys[i] === actionKey)
            return true

    return false
}

