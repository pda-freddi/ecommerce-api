/* These functions accept an array of objects (customer, product, order, etc.) and
format each object to match the schema provided in the API specification. */

const formatProducts = (products) => {
  return products.map(product => {
    return {
      id: product.id,
      name: product.name,
      displayName: product.display_name,
      SKU: product.sku,
      price: parseFloat(product.price),
      description: product.description,
      image: product.image,
      thumbnail: product.thumbnail,
      inStock: product.in_stock,
      categoryId: product.category_id
    };
  });
};

const formatCategories = (categories) => {
  return categories.map(category => {
    return {
      id: category.id,
      name: category.name,
      displayName: category.display_name,
      description: category.description
    };
  });
};

const formatCustomers = (customers) => {
  return customers.map(customer => {
    // Format birth date
    const date = new Date(customer.birth_date);
    const [ year, month, day ] = [date.getFullYear(), date.getMonth(), date.getDate()];
    const formattedBirthDate = `${year}-${month + 1}-${day}`;
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      birthDate: formattedBirthDate,
      phone: customer.phone,
      shoppingSessionId: customer.shopping_session_id
    };
  });
};

module.exports = {
  formatProducts,
  formatCategories,
  formatCustomers
}
