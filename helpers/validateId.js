/*
This function validates an ID parameter. It expects a value that can be 
coerced to a number. A valid ID must be a whole number greater than zero. 
An upper limit of 10^8 for the ID value was set to avoid edge cases.
*/

const validateId = (id) => {
  if (!Number.isInteger(Number(id))) return false;
  if (Number(id) <= 0 || Number(id) > 100000000) return false;
  return Number.parseInt(id);
};

module.exports = validateId;