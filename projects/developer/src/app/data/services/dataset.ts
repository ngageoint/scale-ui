export interface IDatasetDefinition {
    global_data?: IGlobalData;
    global_parameters?: IParameters;
    parameters?: IParameters;
}

export interface IGlobalData {
    files?: {
        [fileName: string]: number[];
    };
    json?:  {
        [input: string]: any
    };
}

export interface IParameters {
    files?: IDataFileParameter[];
    json?: IDataJSONParameter[];
}

export interface IDataFileParameter {
    name: string;
    required?: boolean;
    media_types?: string[];
    multiple?:	boolean;
}

export type JSONDataTypes = 'array'|'boolean'|'integer'|'number'|'object'|'string';

export interface IDataJSONParameter {
    name: string;
    required?: boolean;
    type?: JSONDataTypes;
}
