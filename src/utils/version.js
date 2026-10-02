// 自托管模式：不再访问 huilang-me 的 GitHub 仓库或 Release。
// Worker 与探针的“有新版本”提示依赖上游仓库，自托管后不再做远程检测，
// 保留同名导出以便调用方无需改动。
const EMPTY_REMOTE_VERSION = Object.freeze({ workers: '', agent: '' });

export async function getRemoteVersion() {
  return EMPTY_REMOTE_VERSION;
}

export default { getRemoteVersion };
