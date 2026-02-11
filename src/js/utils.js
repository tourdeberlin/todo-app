export function createElement(options) {
  const { tag = "div", text = "", parent, classNames = [] } = options;
  const node = document.createElement(tag);

  node.textContent = text;

  if (classNames.length > 0) {
    node.classList.add(...classNames);
  }

  if (parent !== null) {
    parent.appendChild(node);
  }

  return node;
}
