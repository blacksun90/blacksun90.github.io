// 진행 중(기간이 '~'로 끝남)은 '진행', 끝난 것은 '완료'.
export function finalColumn(project) {
  return project.period.trim().endsWith('~') ? 'doing' : 'done'
}
