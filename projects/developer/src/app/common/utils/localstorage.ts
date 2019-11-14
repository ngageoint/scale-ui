export class LocalStorageItem {
    private key: string;

    /**
     * Object to represent one data item in local storage.
     * @param key       primary key of the item, will be prefixed
     * @param namespace optional namespace to use in front of key
     */
    constructor(key: string, namespace?: string) {
        const prefix = 'scale';
        if (namespace) {
            this.key = `${prefix}.${namespace}.${key}`;
        } else {
            this.key = `${prefix}.${key}`;
        }
    }

    /**
     * Sets the value to localstorage as JSON, deleting the item if no data is provided.
     * @param value data to be set, empty to remove item
     */
    public set(value?: any): void {
        if (value) {
            const data = JSON.stringify(value);
            localStorage.setItem(this.key, data);
        } else {
            this.remove();
        }
    }

    /**
     * Gets the item from local storage, parsing back from JSON.
     * @return data in the local storage item, if any
     */
    public get(): any {
        const data = localStorage.getItem(this.key);

        if (data) {
            return JSON.parse(data);
        }
    }

    /**
     * Removes the item from local storage.
     */
    public remove(): void {
        localStorage.removeItem(this.key);
    }
}
