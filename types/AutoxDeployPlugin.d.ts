interface PackageJson {
  name: string
  main: string
  version: string
  dist: { dir: string }
  author: string
}

interface Option {
  type: "save" | "rerun"
  srcPath: string
}

interface Project {
  name: string
  main: string
  ignore: string[]
  packageName: string
  versionName: string
  versionCode: number
}
