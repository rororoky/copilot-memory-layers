/**
 * Wrap rendered tables in `.table-wrap` so they scroll instead of overflowing.
 * MDX authors can then write plain Markdown tables.
 */
export default function rehypeWrapTables() {
  return (tree) => {
    walk(tree);
  };
}

function walk(node) {
  if (!node || !Array.isArray(node.children)) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (child.type === 'element' && child.tagName === 'table') {
      const classes = node.properties?.className;
      const alreadyWrapped =
        node.tagName === 'div' &&
        (classes === 'table-wrap' || (Array.isArray(classes) && classes.includes('table-wrap')));

      if (alreadyWrapped) continue;

      node.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrap'] },
        children: [child],
      };
      continue;
    }

    walk(child);
  }
}
