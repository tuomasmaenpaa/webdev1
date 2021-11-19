
let sessionStorage = window.sessionStorage;
let productContainer = document.querySelector('#products-container')
productContainer.addEventListener("click", addProductToCart, false);


const addToCart = (productId, productName) => {
  // TODO 9.2
  // use addProductToCart(), available already from /public/js/utils.js
  // /public/js/utils.js also includes createNotification() function
  addProductToCart(productId);
  const message = 'Added ' + productName + ' to cart!';
  createNotification(message, 'notifications-container');

};

listProducts = async() => {
  //TODO 9.2 
  // - get the 'products-container' element
  // - get the 'product-template' element
  // - use getJSON(url) to get the available products
  // - for each of the products:
  //    * clone the template
  //    * add product information to the template clone
  //    * remember to add an event listener for the button's 'click' event, and call addToCart() in the event listener's callback
  // - remember to add the products to the the page
  const products = await getJSON('/api/products')
  let template = document.getElementById("product-template");
    for(var i = 0; i < products.length; i++){
        let templateClone = template.cloneNode(true);
        const productData = products[i];

        templateClone.content.querySelector("h3.product-name").id = "name-" + productData['_id'];
        templateClone.content.querySelector("p.product-description").id = "description-" + productData['_id'];
        templateClone.content.querySelector("p.product-price").id = "price-" + productData['_id'];
        templateClone.content.querySelector("button").id = "add-to-cart-" + productData['_id'];
        templateClone.content.querySelector('button').addEventListener('click', () => addToCart(productData['_id'], productData['name']));

        templateClone.content.querySelector("h3.product-name").innerText = productData['name'];
        templateClone.content.querySelector("p.product-description").innerText = productData['description'];
        templateClone.content.querySelector("p.product-price").innerText = productData['price'];

        document.getElementById("products-container").appendChild(templateClone.content);
    };
};
listProducts();
