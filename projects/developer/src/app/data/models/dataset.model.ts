import { IDatasetDefinition } from '../services/dataset';

export class Dataset {
    private static build(data) {
        if (data) {
            return new Dataset(
                data.id,
                data.title,
                data.description,
                data.created,
                data.definition,
                data.files,
                data.members
            );
        }
        return new Dataset();
    }

    public static transformer(data) {
        if (data) {
            return Dataset.build(data);
        }
        return null;
    }

    public editDataset() {
        return {
            title: this.title,
            description: this.description
        };
    }

    constructor(
        public id?: number,
        public title?: string,
        public description?: string,
        public created?: string,
        public definition?: IDatasetDefinition,
        public files?: string,
        public members?: string
        ) {
            this.id = this.id || null;
            this.title = this.title || null;
            this.description = this.description || null;
            this.created = this.created || null;
            this.created = this.created || null;
            this.definition = this.definition || { global_data: {}, global_parameters: {}, parameters: {}} ;
            this.files = this.files || null;
            this.members = this.members || null;
        }
}
