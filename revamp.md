

here is api docs-
# Admin API Documentation

> **Base URL**: `/api/admin`  
> **Version**: 1.0.0  
> **Last Updated**: 2026-01-02

## Table of Contents

- [Authentication](#authentication)
  - [Login](#post-login)
  - [Signup](#post-signup)
  - [Refresh Token](#post-refresh)
- [User Management](#user-management)
  - [Get Admin Details](#get-me)
  - [Get User List](#get-userlist)
- [Products](#products)
  - [List Products](#get-getproducts)
  - [Get Product by ID](#get-productsid)
  - [Create Product](#post-addproduct)
  - [Update Product](#put-updateproduct)
  - [Update Stock](#put-updateproductstockbyid)
  - [Delete Product](#delete-deleteproductid)
- [Inventory Management](#inventory-management)
  - [Get Out of Stock Products](#get-out-of-stock)
  - [Get Low Stock Products](#get-low-stock)
  - [Get Product Statistics](#get-stats)
- [Brand Statistics](#brand-statistics)
  - [Get Brand Stats](#get-brand-stats)
  - [Get Unique Brands](#get-brands)
  - [Get Brand Details](#get-brandbrandname)
- [Categories](#categories)
  - [Get Categories](#get-categories)
  - [Get Sub-Categories](#get-categoriescategoryidsub)
  - [Get Sub-Sub-Categories](#get-subcategoriessubcategoryidsub)
  - [Create Category](#post-categories)
  - [Create Sub-Category](#post-categoriescategoryidsub)
  - [Create Sub-Sub-Category](#post-subcategoriessubcategoryidsub)
- [Orders](#orders)
  - [Get All Orders](#get-allordersdate)
  - [Get Order Details](#get-ordersid)
  - [Update Order Status](#put-ordersstatus)
  - [Get User Orders](#get-ordersuserid)
- [Reports](#reports)
  - [Get Report](#get-report)
- [Error Responses](#error-responses)

---

## Authentication

> [!NOTE]
> All endpoints except `/login`, `/signup`, and `/refresh` require authentication.
> Include `Authorization: Bearer <access_token>` header in all protected requests.

### POST `/login`

Authenticate an admin user and receive access tokens.

**Request Body:**

```json
{
  "mobilenumber": "9876543210",
  "password": "your_password"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Admin logged in successfully"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | Mobile number and password are required |
| 401 | Invalid mobile number or password |
| 403 | Access denied. Admins only. |

---

### POST `/signup`

Register a new admin user.

**Request Body:**

```json
{
  "name": "Admin Name",
  "mobilenumber": "9876543210",
  "password": "your_password"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Admin registered successfully"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | Admin with this mobile number already exists |

---

### POST `/refresh`

Refresh access token using a valid refresh token.

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token Refreshed Successfully"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | No refresh token provided |
| 401 | Invalid refresh token |

---

## User Management

### GET `/me`

Get currently authenticated admin's details.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "admin": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin Name",
    "mobilenumber": "9876543210",
    "role": "admin",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

### GET `/userlist`

Get list of all registered users.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "User Name",
      "mobilenumber": "9876543210",
      "role": "user",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Products

### GET `/getproducts`

Get paginated list of products with optional filters.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `search` | string | No | Search in name, brand, tags, description, slug |
| `categoryId` | ObjectId | No | Filter by category (includes descendants) |
| `brand` | string | No | Comma-separated brand names |
| `tags` | string | No | Comma-separated tags |
| `minPrice` | number | No | Minimum price filter |
| `maxPrice` | number | No | Maximum price filter |
| `inStock` | "true" | No | Only show products in stock |

**Success Response (200):**

```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "totalProducts": 150,
  "totalPages": 8,
  "hasNextPage": true,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Product Name",
      "brand": "Brand Name",
      "categoryId": "507f1f77bcf86cd799439012",
      "thumbnail": {
        "publicId": "urs/thumbnails/abc123",
        "url": "http://...",
        "secureUrl": "https://..."
      },
      "variants": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "stock": 100,
          "mrp": 599,
          "sellingPrices": [{ "minQuantity": 1, "price": 499, "discount": 17 }]
        }
      ]
    }
  ]
}
```

---

### GET `/products/:id`

Get detailed product information by ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Product ID |

**Success Response (200):**

```json
{
  "success": true,
  "product": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Product Name",
    "slug": "product-name",
    "brand": "Brand Name",
    "category": "Beauty",
    "subCategory": "Skincare",
    "subSubCategory": "Face Wash",
    "tags": ["organic", "natural"],
    "description": "Product description here...",
    "deliveryOption": {
      "isCancel": true,
      "isReturnable": true,
      "isWarranty": false
    },
    "thumbnail": {
      "publicId": "urs/thumbnails/abc123",
      "url": "http://...",
      "secureUrl": "https://..."
    },
    "variants": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "packOf": 1,
        "measurement": {
          "value": 100,
          "unit": "ml",
          "label": "100ml"
        },
        "mrp": 599,
        "stock": 100,
        "isActive": true,
        "expiry": "2027-12-31T00:00:00.000Z",
        "images": [],
        "sellingPrices": [{ "minQuantity": 1, "price": 499, "discount": 17 }]
      }
    ],
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

### POST `/addproduct`

Create a new product.

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data` | JSON string | Yes | Product data payload |
| `thumbnail` | File | Yes | Thumbnail image |
| `variantImages[0]` | File[] | No | Images for variant at index 0 |
| `variantImages[1]` | File[] | No | Images for variant at index 1 |

**Data Payload Schema:**

```json
{
  "name": "Product Name",
  "slug": "product-name",
  "brand": "Brand Name",
  "categoryId": "507f1f77bcf86cd799439012",
  "tags": ["tag1", "tag2"],
  "description": "Product description",
  "deliveryOption": {
    "isCancel": true,
    "isReturnable": true,
    "isWarranty": false
  },
  "isActive": true,
  "variants": [
    {
      "packOf": 1,
      "measurement": {
        "value": 100,
        "unit": "ml",
        "label": "100ml"
      },
      "mrp": 599,
      "stock": 100,
      "isActive": true,
      "expiry": "2027-12-31",
      "sellingPrices": [{ "minQuantity": 1, "price": 499, "discount": 17 }]
    }
  ]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Product created",
  "product": { ... }
}
```

---

### PUT `/updateproduct`

Update an existing product.

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data` | JSON string | Yes | Product update payload (must include `productId`) |
| `thumbnail` | File | No | New thumbnail image |
| `variantImages[0]` | File[] | No | New images for variant at index 0 |

**Data Payload Schema:**

```json
{
  "productId": "507f1f77bcf86cd799439011",
  "name": "Updated Product Name",
  "brand": "Updated Brand",
  "deletedImages": [
    {
      "publicId": "urs/products/old-image",
      "url": "...",
      "type": "variant",
      "variantIndex": 0
    }
  ],
  "variants": [ ... ]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": { ... }
}
```

---

### PUT `/updateproductstockbyid`

Update stock quantity for a specific variant.

**Request Body:**

```json
{
  "productId": "507f1f77bcf86cd799439011",
  "variantId": "507f1f77bcf86cd799439013",
  "stock": 50
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Stock added by 50"
}
```

---

### DELETE `/deleteproduct/:id`

Delete a product by ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Product ID to delete |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Inventory Management

> [!IMPORTANT]
> These endpoints help manage product inventory by identifying stock issues and providing overall statistics.

### GET `/out-of-stock`

Get paginated list of products that are completely out of stock (all variants have stock = 0).

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |

**Success Response (200):**

```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "totalProducts": 15,
  "totalPages": 1,
  "hasNextPage": false,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Product Name",
      "brand": "Brand Name",
      "categoryId": "507f1f77bcf86cd799439012",
      "thumbnail": {
        "publicId": "urs/thumbnails/abc123",
        "url": "http://...",
        "secureUrl": "https://..."
      },
      "variants": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "stock": 0,
          "mrp": 599,
          "sellingPrices": [{ "minQuantity": 1, "price": 499, "discount": 17 }]
        }
      ]
    }
  ]
}
```

---

### GET `/low-stock`

Get paginated list of products with low stock (at least one variant has 0 < stock < threshold).

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `threshold` | number | No | 2 | Stock threshold (products with stock < this value) |

> [!TIP]
> Use `threshold` parameter to customize what "low stock" means for your business.
> Default is 2, meaning products with stock of 1 will be flagged.

**Success Response (200):**

```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "threshold": 2,
  "totalProducts": 8,
  "totalPages": 1,
  "hasNextPage": false,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Product Name",
      "brand": "Brand Name",
      "categoryId": "507f1f77bcf86cd799439012",
      "thumbnail": {
        "publicId": "urs/thumbnails/abc123",
        "url": "http://...",
        "secureUrl": "https://..."
      },
      "variants": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "stock": 1,
          "mrp": 599,
          "sellingPrices": [{ "minQuantity": 1, "price": 499, "discount": 17 }]
        }
      ]
    }
  ]
}
```

---

### GET `/stats`

Get overall product statistics including total counts, stock status, and active/inactive breakdown.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `threshold` | number | No | 2 | Stock threshold for low stock calculation |

**Success Response (200):**

```json
{
  "success": true,
  "stats": {
    "totalProducts": 250,
    "activeProducts": 235,
    "inactiveProducts": 15,
    "outOfStockProducts": 18,
    "lowStockProducts": 12,
    "inStockProducts": 217
  }
}
```

**Field Descriptions:**
| Field | Description |
|-------|-------------|
| `totalProducts` | Total number of products in database |
| `activeProducts` | Products with `isActive` = true |
| `inactiveProducts` | Products with `isActive` = false |
| `outOfStockProducts` | Active products with all variants stock = 0 |
| `lowStockProducts` | Active products with at least one variant having 0 < stock < threshold |
| `inStockProducts` | Active products with total stock > 0 |

---

## Brand Statistics

### GET `/brand-stats`

Get paginated list of all brands with product statistics and category breakdown.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 20 | Items per page (max: 100) |
| `active` | "0" | No | - | Include inactive products |
| `search` | string | No | - | Filter brands by name |

**Success Response (200):**

```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "totalBrands": 50,
  "totalPages": 3,
  "hasNextPage": true,
  "brands": [
    {
      "brand": "Brand Name",
      "totalProducts": 25,
      "categoryBreakdown": [
        {
          "categoryId": "507f1f77bcf86cd799439012",
          "categoryName": "Skincare",
          "productCount": 15
        },
        {
          "categoryId": "507f1f77bcf86cd799439013",
          "categoryName": "Haircare",
          "productCount": 10
        }
      ]
    }
  ]
}
```

---

### GET `/brands`

Get simple list of unique brand names (for dropdowns/filters).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `active` | "0" | No | Include inactive products |
| `search` | string | No | Filter brands by name |

**Success Response (200):**

```json
{
  "success": true,
  "count": 50,
  "brands": ["Brand A", "Brand B", "Brand C"]
}
```

---

### GET `/brand/:brandName`

Get detailed statistics for a specific brand.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `brandName` | string | URL-encoded brand name |

**Success Response (200):**

```json
{
  "success": true,
  "brand": "Brand Name",
  "totalProducts": 25,
  "activeProducts": 23,
  "inactiveProducts": 2,
  "categoryBreakdown": [
    {
      "categoryId": "507f1f77bcf86cd799439012",
      "categoryName": "Skincare",
      "productCount": 15
    }
  ],
  "stockStats": {
    "inStock": 20,
    "outOfStock": 5
  },
  "priceRange": {
    "min": 99,
    "max": 2999
  }
}
```

---

## Categories

> [!TIP]
> Categories follow a 3-level hierarchy:
>
> - **Level 0**: Category (e.g., "Beauty")
> - **Level 1**: Sub-Category (e.g., "Skincare")
> - **Level 2**: Sub-Sub-Category (e.g., "Face Wash")

### GET `/categories`

Get all top-level categories (level 0).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `active` | "0" | No | Include inactive categories |

**Success Response (200):**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Beauty",
      "parent": null,
      "level": 0,
      "path": [],
      "isActive": true
    }
  ]
}
```

---

### GET `/categories/:categoryId/sub`

Get sub-categories (level 1) under a category.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `categoryId` | ObjectId | Parent category ID |

**Success Response (200):**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Skincare",
      "parent": "507f1f77bcf86cd799439011",
      "level": 1,
      "path": ["507f1f77bcf86cd799439011"],
      "isActive": true
    }
  ]
}
```

---

### GET `/subcategories/:subCategoryId/sub`

Get sub-sub-categories (level 2) under a sub-category.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `subCategoryId` | ObjectId | Parent sub-category ID |

**Success Response (200):**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Face Wash",
      "parent": "507f1f77bcf86cd799439012",
      "level": 2,
      "path": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
      "isActive": true
    }
  ]
}
```

---

### POST `/categories`

Create a new top-level category.

**Request Body:**

```json
{
  "name": "New Category"
}
```

**Success Response (201):**

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "New Category",
    "parent": null,
    "level": 0,
    "path": [],
    "isActive": true
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | name is required |
| 409 | Category already exists |

---

### POST `/categories/:categoryId/sub`

Create a new sub-category under a category.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `categoryId` | ObjectId | Parent category ID |

**Request Body:**

```json
{
  "name": "New Sub-Category"
}
```

**Success Response (201):**

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "name": "New Sub-Category",
    "parent": "507f1f77bcf86cd799439011",
    "level": 1,
    "path": ["507f1f77bcf86cd799439011"],
    "isActive": true
  }
}
```

---

### POST `/subcategories/:subCategoryId/sub`

Create a new sub-sub-category under a sub-category.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `subCategoryId` | ObjectId | Parent sub-category ID |

**Request Body:**

```json
{
  "name": "New Sub-Sub-Category"
}
```

**Success Response (201):**

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "name": "New Sub-Sub-Category",
    "parent": "507f1f77bcf86cd799439012",
    "level": 2,
    "path": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "isActive": true
  }
}
```

---

## Orders

### GET `/allorders/date`

Get orders with optional date range and status filters.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | ISO Date | No | Start date filter |
| `to` | ISO Date | No | End date filter |
| `status` | string | No | Filter by order status |

> [!NOTE]
> If no filters are provided, only the most recent 30 orders are returned.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Orders Fetched SuccessFully",
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "products": [...],
      "totalAmount": 1599,
      "status": "processing",
      "address": {...},
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/orders/:id`

Get detailed information for a specific order.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | Order ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Order Fetched Successfully",
  "orderDetail": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Customer Name",
    "mobilenumber": "9876543210",
    "address": {
      "street": "123 Main St",
      "city": "City",
      "state": "State",
      "pincode": "123456"
    },
    "totalAmount": 1599,
    "noOfProducts": 3,
    "products": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "variantId": "507f1f77bcf86cd799439014",
        "name": "Product Name",
        "thumbnail": {...},
        "quantity": 2
      }
    ]
  }
}
```

---

### PUT `/orders/status`

Update the status of an order.

**Request Body:**

```json
{
  "OrderId": "507f1f77bcf86cd799439011",
  "status": "shipped"
}
```

**Common Status Values:**

- `placed`
- `shipped`
- `delivered`
- `cancelled`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Status updated to shipped"
}
```

---

### GET `/orders/user/:id`

Get recent orders for a specific user.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | ObjectId | User ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Order Fetch Successfully",
  "orders": [...]
}
```

> [!NOTE]
> Returns maximum 20 most recent orders for the user.

---

## Reports

### GET `/report`

Get business analytics report.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | ISO Date | No | Start date for report period |
| `to` | ISO Date | No | End date for report period |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Report fetched successfully",
  "revenue": 125000,
  "noOfOrders": 250,
  "noOfProductSales": 750,
  "noOfUsersOrdered": 180,
  "noOfUsersRegistered": 500
}
```

---

## Error Responses

All API errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes

| Status | Description                             |
| ------ | --------------------------------------- |
| 200    | Success                                 |
| 201    | Created                                 |
| 400    | Bad Request - Invalid input             |
| 401    | Unauthorized - Invalid or missing token |
| 403    | Forbidden - Insufficient permissions    |
| 404    | Not Found - Resource doesn't exist      |
| 409    | Conflict - Resource already exists      |
| 500    | Internal Server Error                   |

---

## Database Indexes

> [!IMPORTANT]
> The following indexes are recommended for optimal query performance:

### Product Collection

| Index                     | Fields                                | Purpose                      |
| ------------------------- | ------------------------------------- | ---------------------------- |
| `brand`                   | `{ brand: 1 }`                        | Brand filtering & statistics |
| `categoryId`              | `{ categoryId: 1 }`                   | Category filtering           |
| `isActive`                | `{ isActive: 1 }`                     | Active product filtering     |
| `slug`                    | `{ slug: 1 }`                         | Unique slug lookups          |
| `tags_active_idx`         | `{ tags: 1, isActive: 1 }`            | Tag-based queries            |
| `product_text_search_idx` | Text index on name, description, tags | Full-text search             |

### Category Collection

| Index    | Fields                             | Purpose                    |
| -------- | ---------------------------------- | -------------------------- |
| `parent` | `{ parent: 1 }`                    | Category hierarchy queries |
| `level`  | `{ level: 1 }`                     | Level-based filtering      |
| Compound | `{ parent: 1, level: 1, name: 1 }` | Unique constraint          |

---

_Documentation generated for URS Backend API_
