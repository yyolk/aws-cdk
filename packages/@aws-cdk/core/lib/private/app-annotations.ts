import fs = require('fs');
import path = require('path');

import { Construct, IConstruct, ISynthesisSession } from '../construct';

interface Node {
  id: string;
  path: string;
  children?: Node[];
}

/**
 * @experimental
 */
export class AppAnnotations extends Construct {
  constructor(scope: Construct) {
    super(scope, 'AppAnnotations');
  }

  protected synthesize(session: ISynthesisSession) {
    const lookup: { [path: string]: Node } = { };

    const visit = (construct: IConstruct): Node => {
      const children = construct.node.children.map(visit);
      const node: Node = {
        id: construct.node.id || 'App',
        path: construct.node.path,
        children: children.length === 0 ? undefined : children,
      };

      lookup[node.path] = node;

      return node;
    };

    const root = visit(this.node.root);

    const builder = session.assembly;
    fs.writeFileSync(path.join(builder.outdir, 'annotations.json'), JSON.stringify(root, undefined, 2));

    // TODO: Register this artifact into the CloudAssembly
  }
}