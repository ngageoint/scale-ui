export class ApiResults {
    constructor(
        public count: number,
        public next: string,
        public previous: string,
        public results: any[]
    ) {}
}
