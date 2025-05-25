export function isSidebarItemActive(currentPath, itemLink) {
  if (itemLink === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(itemLink);
}
