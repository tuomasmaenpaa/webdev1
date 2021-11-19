let sessionStorage = window.sessionStorage;

document.querySelector("#place-order-button").addEventListener("click",() => placeOrder(), false);


const addToCart = productId => {
  // TODO 9.2
  // use addProductToCart(), available already from /public/js/utils.js
  // call updateProductAmount(productId) from this file
  addProductToCart(productId);
  updateProductAmount(productId);

};

const decreaseCount = productId => {
  // TODO 9.2
  // Decrease the amount of products in the cart, /public/js/utils.js provides decreaseProductCount()
  // Remove product from cart if amount is 0,  /public/js/utils.js provides removeElement = (containerId, elementId
  
  const productCount = getProductCountFromCart(productId);
  console.log(productCount);
  if(productCount > 1){
    decreaseProductCount(productId);
    document.querySelector("#amount-" + productId).innerText = productCount.toString() + "x";
  }else{
    removeElement('cart-container','product-'+productId);
  }

  updateProductAmount(productId);
};

const updateProductAmount = productId => {
  // TODO 9.2
  // - read the amount of products in the cart, /public/js/utils.js provides getProductCountFromCart(productId)
  // - change the amount of products shown in the right element's innerText
  const productAmount = getProductCountFromCart(productId);
  sessionStorage.setItem(productId, productAmount);
  document.querySelector("#amount-" + productId).innerText = productAmount.toString() + "x";

};


const placeOrder = async() => {
  // TODO 9.2
  // Get all products from the cart, /public/js/utils.js provides getAllProductsFromCart()
  // show the user a notification: /public/js/utils.js provides createNotification = (message, containerId, isSuccess = true)
  // for each of the products in the cart remove them, /public/js/utils.js provides removeElement(containerId, elementId)
  
  createNotification("Successfully created an order!", "notifications-container", true);
  clearCart();
  let container = document.getElementById("cart-container");
  container.innerHTML = '';

};

(async() => {
  // TODO 9.2
  // - get the 'cart-container' element
  // - use getJSON(url) to get the available products
  // - get all products from cart
  // - get the 'cart-item-template' template
  // - for each item in the cart
  //    * copy the item information to the template
  //    * hint: add the product's ID to the created element's as its ID to 
  //        enable editing ith 
  //    * remember to add event listeners for cart-minus-plus-button
  //        cart-minus-plus-button elements. querySelectorAll() can be used 
  //        to select all elements with each of those classes, then its 
  //        just up to finding the right index.  querySelectorAll() can be 
  //        used on the clone of "product in the cart" template to get its two
  //        elements with the "cart-minus-plus-button" class. Of the resulting
  //        element array, one item could be given the ID of 
  //        `plus-${product_id`, and other `minus-${product_id}`. At the same
  //        time we can attach the event listeners to these elements. Something 
  //        like the following will likely work:
  //          clone.querySelector('button').id = `add-to-cart-${prodouctId}`;
  //          clone.querySelector('button').addEventListener('click', () => addToCart(productId, productName));
  //
  // - in the end remember to append the modified cart item to the cart 
  let template = document.getElementById("cart-item-template");
  const productsAvailable = await getJSON('/api/products');
  productsInCart = getAllProductsFromCart();
  productsInCart.forEach((productData) => {
   
    /**
     * Since getAllProductsFromCart returns a list with the product ids as 'name',
     * a little trickery is needed to get the right information about the product
     */
    const product = productsAvailable.find(p => p._id === productData['name'])
    if(product){
      const productId = product['_id'];
      const productName = product['name'];


      let templateClone = template.cloneNode(true);
      templateClone.content.querySelector(".item-row").id = "product-" + productId;
      templateClone.content.querySelector("h3.product-name").id = "name-" + productId;
      templateClone.content.querySelector("p.product-price").id = "price-" + productId;
      templateClone.content.querySelector("p.product-amount").id = "amount-" + productId;

      templateClone.content.querySelectorAll("button")[0].id = "plus-" + productId;
      templateClone.content.querySelector("#plus-"+productId).addEventListener('click', () => addToCart(productId, productName));

      templateClone.content.querySelectorAll("button")[1].id = "minus-" + productId;
      templateClone.content.querySelectorAll("button")[1].addEventListener('click', () => decreaseCount(productId));

      templateClone.content.querySelector("h3.product-name").innerText = productName;
      templateClone.content.querySelector("p.product-amount").innerText = getProductCountFromCart(productId) + "x";
      templateClone.content.querySelector("p.product-price").innerText = product['price'];

      document.getElementById("cart-container").appendChild(templateClone.content);
    }
  })


})();
