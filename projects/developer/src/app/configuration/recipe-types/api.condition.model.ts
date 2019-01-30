import { RecipeTypeInputInterfaceFile } from './api.input-interface.file.model';
import { RecipeTypeInputInterfaceJson} from './api.input-interface.json.model';

export class RecipeTypeCondition {
    title: string;

    private static build(data) {
        if (data) {
            return new RecipeTypeCondition(
                {
                    files: RecipeTypeInputInterfaceFile.transformer(data.condition_interface.files),
                    json: RecipeTypeInputInterfaceJson.transformer(data.condition_interface.json)
                },
                data.data_filter
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => RecipeTypeCondition.build(item));
            }
            return RecipeTypeCondition.build(data);
        }
        return null;
    }
    constructor(
        public condition_interface: any,
        public data_filter: any
    ) {}
}
