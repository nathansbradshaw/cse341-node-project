const https = require('https');
const Product = require('../models/product');
const Order = require('../models/order');
const fetch = require('node-fetch');


exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',

      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',

      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find({ isFeatured: true })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,

      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          fname: req.user.fname,
          lname: req.user.lname,
          userId: req.user,
          email: req.user.email,
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,

      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartRemoveOne = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.removeOneFromCart(product);
    })
    .then(result => {
      // console.log(result);
      res.redirect('/cart');
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getPagination = (req, res, next) => {
  
  if (!global.jsonResponse) {
    console.log("No json data")

    let url = 'https://byui-cse.github.io/cse341-course/lesson03/items.json'
    https.get(url, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          global.jsonResponse = JSON.parse(body)
        } catch (error) {
          console.error(error.message);
        };
      })

    }).on("error", (error) => {
      console.error(error.message);
    });
  }

  if (global.jsonResponse) {
    let searchedValue = req.body.searchValue || req.query.searchValue || '' 
    const ITEMS_PER_PAGE = 10 // Limit of 10 items per page.
    const json = global.jsonResponse
    let page = req.query.page || 1 // Grab our page number, 1 if undefined
    const indexStart = (page - 1) * ITEMS_PER_PAGE // Item index to start on...
    const indexEnd = page * ITEMS_PER_PAGE
    const filteredData = global.jsonResponse.filter(x =>
      x.name.toLowerCase().includes(searchedValue.toLowerCase())
  )
    // console.log(filteredData)
    res.render('shop/pagination', {
      data: filteredData.slice(indexStart, indexEnd),
      path: '/pagination',
      pageTitle: 'pagination',
      searchedValue: searchedValue,
      page: page,
      numPages: Math.ceil(filteredData.length / ITEMS_PER_PAGE),
    })
  } else {
    res.redirect('/pagination')
  }
  
};


exports.postPagination = (req, res, next) => {
  const json = global.jsonResponse
  console.log(json)
  res.render('shop/pagination', {
    path: '/pagination',
    pageTitle: 'pagination',
  })
};


exports.processJson = (req, res, next) => {
  let url = 'https://byui-cse.github.io/cse341-course/lesson03/items.json'
  https.get(url, (res) => {
    let body = "";

    res.on("data", (chunk) => {
      body += chunk;
    });

    res.on("end", () => {
      try {
        global.jsonResponse = JSON.parse(body)
      } catch (error) {
        console.error(error.message);
      };
    })

  }).on("error", (error) => {
    console.error(error.message);
  });
}


exports.getPokemon = (req, res, next) => { 
  let offset = 0;
  let limit = 10;
  let jsonData
  fetch('https://pokeapi.co/api/v2/pokemon?offset='+ offset + '&limit=10')
    .then(res => res.json())
    .then(json => {jsonData = json
      res.render('shop/pokemon', {
        path: '/pokemon',
        pageTitle: 'pokemon',
        
      })
    });
}