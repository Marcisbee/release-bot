interface Config {
  types: Record<string, number>;
  alias: Record<string, string>;
}

interface Change {
  type: string;
  category: string;
  description: string;
}

interface DeleteFile {
  path: string;
  sha: string;
}

interface PullRequest {
  body: string;
  title: string;
}

interface FieldFile {
  path: string;
  content: string;
  sha?: string;
}

interface Fields {
  files: FieldFile[];
  deleteFiles: DeleteFile[];
  pr: PullRequest;
  branch: string;
}
