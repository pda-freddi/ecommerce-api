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

module.exports = {
  formatProducts,
  formatCategories
}
