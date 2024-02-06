const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/shop-cart")
.then((resault)=>{
console.log("Connecting To DB ....");
})
.catch((err)=>{
console.log(err);
});
const Product = require("../models/product");
const products = [
    new Product({
        imagePath: "./images/product1.jpg",
        productName : "Huwawi Y9",
        information:{
        storageCapacity  : "64 GB",
        numberOfSim : "DUAL SIM",
        realComaraResaluation :"16 MB",
        dualSize: "6.5 INCH"
        },
        price : 120
    }),
    new Product({
        imagePath: "./images/product2.jpg",
        productName : "Huwawi X9",
        information:{
        storageCapacity  : "15 GB",
        numberOfSim : "DUAL SIM",
        realComaraResaluation :"22 MB",
        dualSize: "8.5 INCH"
        },
        price : 150
    }),
    new Product({
        imagePath: "./images/product3.jpg",
        productName : "LAPTOP Y9",
        information:{
        storageCapacity  : "65 GB",
        numberOfSim : "DUAL SIM",
        realComaraResaluation :"44 MB",
        dualSize: "5 INCH"
        },
        price : 165
    }),
    new Product({
        imagePath: "./images/product4.jpg",
        productName : "MOBILE Y9",
        information:{
        storageCapacity  : "57 GB",
        numberOfSim : "DUAL SIM",
        realComaraResaluation :"66 MB",
        dualSize: "2.5 INCH"
        },
        price : 250
    }),
    new Product({
        imagePath: "./images/product5.jpg",
        productName : "MOBILE M9",
        information:{
        storageCapacity  : "98 GB",
        numberOfSim : "DUAL SIM",
        realComaraResaluation :"11 MB",
        dualSize: "3.5 INCH"
        },
        price : 550
    }),
    new Product({
        imagePath: "./images/product6.jpg",
        productName : "Nokia",
        information:{
        storageCapacity  : "31 GB",
        numberOfSim : "DUAL SIM",
        realComaraResaluation :"99 MB",
        dualSize: "4.5 INCH"
        },
        price : 500
    })
];
var done = 0;
for(var i = 0 ; i < products.length ; i ++)
{
    products[i].save()
    .then((resault)=>{
        console.log(resault);
        done ++;
        if(done === products.length)
        {
            mongoose.disconnect();
        }
    })
    .catch((err)=>{
        console.log(err);
    });
}
