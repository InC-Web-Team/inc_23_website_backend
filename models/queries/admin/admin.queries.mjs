function adminQueries(tableName) {
  const findAdmin = `CALL getAdminInfo(?);`

  return {
    findAdmin,
  }
}

export { adminQueries }