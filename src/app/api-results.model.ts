export class ApiResults {
    private static build(data) {
        if (data) {
            return new ApiResults(
                data.count,
                data.next,
                data.previous,
                data.results
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => ApiResults.build(item));
            }
            return ApiResults.build(data);
        }
        return null;
    }
    constructor(
        public count: number,
        public next: string,
        public previous: string,
        public results: any[]
    ) {}
}
