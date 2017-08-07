export class RecipeTypesDatatable {
    constructor(
        public first: number,
        public rows: number,
        public sortField: string,
        public sortOrder: number,
        public started: Date,
        public ended: Date
    ) {}
}

export const initialRecipeTypesDatatable: RecipeTypesDatatable = {
    first: 0,
    rows: 10,
    sortField: 'title',
    sortOrder: 1,
    started: null,
    ended: null
};
