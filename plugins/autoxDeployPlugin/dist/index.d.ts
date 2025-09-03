interface PackageJson {
    name: string;
    main: string;
    version: string;
    dist: {
        dir: string;
    };
    author: string;
}
interface Option {
    hook?: string;
    params: string;
    package_json: PackageJson;
}
export default function autoxDeployPlugin(options: Option): {
    [x: string]: string | (() => Promise<void>);
    name: string;
};
export {};
