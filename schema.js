// schema.js
const { buildSchema } = require('graphql');
const Category = require('./model/category');
const Product = require('./model/product');
const User = require('./model/user');
const bcrypt = require('bcrypt')

// Define GraphQL schema
const schema = buildSchema(`
  input CategoryInput {
    _id: ID
    name: String
    parentId: ID
    children: [ID]
  }

  input ProductInput {
    name: String!
    description: String
    price: Float!
    quantity: Int!
    sku: String!
    imageUrl: String
    imageHash: String
    category: ID
  }
  type Category {
    _id: ID!
    name: String!
    parentId: String
    children: [Category]
  }
 type Product {
    _id: ID!
    name: String!
    description: String
    price: Float!
    quantity: Int!
    imageUrl: String
    imageHash: String
    sku: String!
    category: ID
 }

 type ProductPagination {
    products: [Product!]!
    totalPages: Int!
  }
  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    role: String
    outlet: String
  }

  type Query {
    categories: [Category]
    category(id: ID!): Category
    products(page: Int, pageSize: Int, search: String): ProductPagination!
    product(id: ID!): Product
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    addCategory(name: String!, parentId: String): Category
    updateCategory(id: ID!, name: String!): Category
    deleteCategory(id: ID!): Boolean
    addProduct(input: ProductInput!): Product
    updateProduct(id: ID!, input:ProductInput): Product
    deleteProduct(id: ID!): Boolean
    addUser(username: String!, email: String!, password: String!, role: String, outlet: String): User
    deleteUser(id: ID!): Boolean
    updateUser(id: ID!, username: String!, email: String!, password: String!, role: String, outlet: String): User
  }
`);


// Define resolvers
const root = {
  categories: async () => {
    const categories = await Category.find().populate('children');
    return categories;
  },
  category: async ({ id }) => {
    return await Category.findById(id);
  },
  addCategory: async ({ name, parentId }) => {
    const category = new Category({ name, parentId });

    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      parentCategory.children.push(category._id);
      await parentCategory.save();
    }

    const newCategory = await category.save();
    return newCategory;
  },
  updateCategory: async ({ id, name }) => {
    const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
    return updatedCategory;
  },
  deleteCategory: async ({ id }) => {
    await Category.findByIdAndDelete(id);
    return true;
  },

  // product resolver
  products: async ({page=1, pageSize=5, search=''}) => {
    try {
        const pageNumber = parseInt(page, 10);
        const pageSizeNumber = parseInt(pageSize, 10);

        if (pageNumber < 1 || pageSizeNumber < 1) {
          throw new Error('Page and page size must be greater than 0');
        }

        // Search query
        const query = search ? { name: new RegExp(search, 'i') } : {};

        // Fetch products with pagination
        const products = await Product.find(query)
          .skip((pageNumber - 1) * pageSizeNumber)
          .limit(pageSizeNumber);

        // Total count of products matching the search
        const totalProducts = await Product.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / pageSizeNumber);

        // Return an object matching the ProductPagination type
        return { products, totalPages };
      } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error('Failed to fetch products. Please try again.');
      }
  },

  product: async({id}) => {
    const product = await Product.findById(id);
    return product
  },

  addProduct: async({input}) => {
    const { name, description, price, quantity, category, imageUrl, imageHash, sku } = input;
    const newProduct = new Product({ name, description, price, quantity, imageUrl, imageHash, sku, category });
    await newProduct.save();
    return newProduct
  },
  updateProduct: async({id, input}) => {
    const { name, description, price, quantity, category, imageUrl, imageHash, sku } = input;
    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { name, description, price, quantity, imageUrl, imageHash, sku, category },
        { new: true }
      );
      return updatedProduct
  },
  deleteProduct: async ({ id }) => {
    await Product.findByIdAndDelete(id);
    return true;
  },
  // user resolver
  users: async () => {
    const users = await User.find()
    return users;
  },
  user: async ({id}) => {
    const user = await User.findById(id);
    return user;
  },
  addUser: async ({username, email, password, role, outlet}) => {
    const bcryptPassword = await bcrypt.hash(password, 10);
    const newUser = new User({username, email, password: bcryptPassword, outlet, role});
    await newUser.save();
    return newUser;
  }, 
  updateUser: async ({id, username, email, password, role, outlet}) => {
    const bcryptPassword = await bcrypt.hash(password, 10);
    const updateUser = User.findByIdAndUpdate(id, {username, email, password:bcryptPassword, role, outlet}, {new: true});
    return updateUser
  },
  deleteUser: async ({id}) => {
    await User.findByIdAndDelete(id);
    return true;
  }

  
};

module.exports = { schema, root };
