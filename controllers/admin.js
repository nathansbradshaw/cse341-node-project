const Product = require('../models/product');

const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  let isFeatured = false;
  if(req.body.isfeatured) {
    isFeatured = true;
  }

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
        isFeatured: isFeatured
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const product = new Product({ title: title, price: price, description: description, imageUrl: imageUrl, userId: req.user, isFeatured: isFeatured });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);
  let updatedisFeatured = false;
  if(req.body.isfeatured) {
    updatedisFeatured = true;
  }


  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
        isFeatured: updatedisFeatured
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  Product.findById(prodId).then(product => {
    if ((product.userId.toString() !== req.user._id.toString()) && !req.user.isAdmin) {
      return res.redirect('/');
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    product.imageUrl = updatedImageUrl;
    product.isFeatured = updatedisFeatured
    return product.save().then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProducts = (req, res, next) => {
  //Check if user is the admin
  if(req.user.isAdmin) {
    Product.find()
    .then(products => {
      return res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',

      });
    })
  } else {
    Product.find({ userId: req.user._id })
    .then(products => {
      return res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',

      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  }
  
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  if(req.user.isAdmin) {
    Product.deleteOne({ _id: prodId })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  } else {
    Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  }
  
};
