var Product = require('../models/product');

// get all products
exports.getAllProducts = function (req, res) {
    try {
        const perPage = 50
        const page = req.params.page || 1
        const sort = req.params.sort
        let sortBy = {}
        let findBy = {}
        if(sort === 'top') {
            sortBy = {newest_rank: 1}
            findBy.newest_rank = {$gt: 0}
        } else if(sort === 'newest') {
            sortBy = {first_time_on_amazon: -1}
        } else if(sort === 'trend') {
            sortBy = {newest_rank: 1}
            findBy.newest_rank = {$gt: 0}
        }

        const {start, end, keywords} = req.query
        if(start && end) {
            findBy.first_time_on_amazon = {$gte: start, $lte: end}
        } else if(start && !end) {
            findBy.first_time_on_amazon = {$gte: start}
        } else if(!start && end) {
            findBy.first_time_on_amazon = {$lte: end}
        }

        console.log(keywords)
        if(Array.isArray(keywords) && keywords.length > 0) {
            findBy.keywords = { $all: keywords}
        }
        Product.find(findBy)
        .sort(sortBy)
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, products) {
            if(err) {
                return res.json({
                    success: false,
                    message: err.message
                })
            }
            Product.countDocuments(findBy).exec(function(err, count) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err.message
                    })
                }
                return res.json({
                    success: true,
                    data: products,
                    page: page,
                    limit: perPage,
                    total: count
                })
            })
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
};

// get product by id
exports.getProductById = function (req, res) {
    try {
        const { id } = req.params
        Product.findOne({ _id: id }, function(err, product) {
            if(err) {
                return res.json({
                    success: false,
                    message: err.message
                })
            }
            return res.json({
                success: true,
                data: product
            })
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
};

// create a product
exports.postProduct = function (req, res) {
    try {
        const product = new Product(req.body)
        product.save(function (err, newProduct) {
            if (err) {
                return res.json({
                    success: false,
                    message: err.message
                });
            }
            return res.json({
                success: true,
                message: 'Create product success',
                data: newProduct
            });
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
};

// update a product
exports.putProduct = function (req, res) {
    try {
        Product.findOneAndUpdate({_id: req.params.id}, req.body, function(err, productUpdated) {
            if(err) {
                return res.json({
                    success: false,
                    message: err.message
                })
            }
            return res.json({
                success: true,
                message: 'Update product success',
                data: productUpdated
            })
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
};

// delete a product
exports.deleteProduct = function (req, res) {
    try {
        Product.findOneAndRemove({_id: req.params.id}, function(err) {
            if(err) {
                return res.json({
                    success: false,
                    message: err.message
                })
            }
            return res.json({
                success: true,
                message: 'Delete product success'
            })
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
};
