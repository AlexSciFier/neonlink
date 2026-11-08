/**
 * Builds an SQL fragment restricting a statement to rows the caller may modify.
 *
 * - No scope / no userId (authentication disabled, system user): unrestricted,
 *   matching how the read queries behave in that mode.
 * - Regular user: rows they own.
 * - Admin: rows they own plus shared rows (userId 0 / NULL).
 *
 * @param {{userId?: number, isAdmin?: boolean} | undefined} scope
 * @param {string} column
 */
export function ownerCondition(scope, column = "userId") {
  if (!scope || !scope.userId) return { sql: "1=1", params: {} };
  const params = { ownerId: scope.userId };
  if (scope.isAdmin)
    return {
      sql: `(${column} = :ownerId OR ${column} IS NULL OR ${column} = 0)`,
      params,
    };
  return { sql: `${column} = :ownerId`, params };
}
