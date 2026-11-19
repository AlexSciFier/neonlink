/**
 * Builds an SQL fragment restricting a statement to rows the caller may modify.
 *
 * - Explicit authentication-disabled system scope: unrestricted.
 * - Missing or invalid scope: reject the operation.
 * - Regular user: rows they own.
 * - Admin: rows they own plus shared rows (userId 0 / NULL).
 *
 * @param {{userId: number, isAdmin?: boolean, authDisabled?: boolean}} scope
 * @param {string} column
 */
export function ownerCondition(scope, column = "userId") {
  if (scope?.authDisabled === true && scope.userId === 0)
    return { sql: "1=1", params: {} };
  if (!Number.isSafeInteger(scope?.userId) || scope.userId <= 0)
    throw new Error("A valid authorization scope is required");
  const params = { ownerId: scope.userId };
  if (scope.isAdmin)
    return {
      sql: `(${column} = :ownerId OR ${column} IS NULL OR ${column} = 0)`,
      params,
    };
  return { sql: `${column} = :ownerId`, params };
}

export function visibleCondition(scope, column = "userId") {
  const owner = ownerCondition(scope, column);
  if (scope.authDisabled === true) return owner;
  return {
    sql: `(${column} = :ownerId OR ${column} IS NULL OR ${column} = 0)`,
    params: owner.params,
  };
}
