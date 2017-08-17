class Condition {
    constructor(
        public media_type?: string,
        public data_types?: string[]
    ) {}
}

export class TriggerData {
    constructor(
        public input_data_name: string,
        public workspace_name: string
    ) {}
}

export class TriggerConfiguration {
    constructor(
        public data: TriggerData,
        public version?: string,
        public condition?: Condition,
    ) {
        this.condition = this.condition || {};
    }
}

export class Trigger {
    constructor(
        public type: string,
        public configuration: TriggerConfiguration,
        public is_active?: boolean
    ) {}
}
