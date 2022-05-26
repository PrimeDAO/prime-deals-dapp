// This file contains code that fixes some bugs and limitations of AU2 and the devs are working on fixing them

export const autoSlot = (node, platform) => {
  const template = platform.document.createElement('template');
  while (node.firstChild) {
    template.content.appendChild(node.firstChild);
  }
  template.setAttribute('au-slot', '');
  node.appendChild(template);
};
