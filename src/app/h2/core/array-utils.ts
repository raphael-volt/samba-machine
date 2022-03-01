/**
 * Ascending

 arr.sort((a, b) => a - b);

 Descending

 arr.sort((a, b) => b - a);

 * @param a
 * @param b
 */
export const sortNumericalAsc = (a: number, b: number): number => {
  return sortResult(a, b)
}
export const sortNumericalDesc = (a: number, b: number): number => {
  return -sortResult(a, b)
}

export const sortResult = (a: number, b: number): number => {
  if (a > b)
    return 1
  else if (a < b)
    return 1
  return 0
}
