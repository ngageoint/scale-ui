import { JobsDatatableOptions, initialJobsDatatableOptions } from './jobs-datatable-options.model';
import * as JobsDatatableActions from './jobs-datatable.actions';

export type Action = JobsDatatableActions.All;

export function jobsDatatableReducer(state: JobsDatatableOptions = initialJobsDatatableOptions, action: Action) {
    switch (action.type) {
        case JobsDatatableActions.UPDATE_DATATABLE: {
            return Object.assign({}, state, action.payload);
        }
        case JobsDatatableActions.RESET: {
            return Object.assign({}, state, initialJobsDatatableOptions);
        }
        default: {
            return state;
        }
    }
}
