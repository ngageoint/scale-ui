export class Dataset {

    private static build(data) {
        if (data) {
            return new Dataset();
        }
    }

    public static transformer(data) {
        if (data) {
            return Dataset.build(data);
        }
        return null;
    }

    constructor() {}
}
