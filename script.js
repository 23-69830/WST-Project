let navigation = document.querySelector('.navigation');

document.querySelector('#menu-btn').onclick = () =>{
    navigation.classList.toggle('active');
    cartItem.classList.remove('active');
    searchForm.classList.remove('active');
}

let cartItem = document.querySelector('.cart-items-container');

document.querySelector('#cart-btn').onclick = () =>{
    cartItem.classList.toggle('active');
    navigation.classList.remove('active');
    searchForm.classList.remove('active');
}

let searchForm = document.querySelector('.search-form');

document.querySelector('#search-btn').onclick = () =>{
    searchForm.classList.toggle('active');
    navigation.classList.remove('active');
    cartItem.classList.remove('active');
}

window.onscroll = () =>{
    navigation.classList.remove('active');
    cartItem.classList.remove('active');
    searchForm.classList.remove('active');
}



function addToCart(imageSrc, itemName, price) {
    var cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    var removeButton = document.createElement("span");
    removeButton.className = "fas fa-times";
    removeButton.onclick = function () {
        cartItem.parentNode.removeChild(cartItem);

        // Check if there are any remaining cart items
        var cartItemsContainer = document.querySelector(".cart-items-container");
        var remainingCartItems = cartItemsContainer.querySelectorAll(".cart-item");
        
        // If there are no remaining items, remove the "Check Out" button
        if (remainingCartItems.length === 0) {
            var checkoutButton = document.querySelector(".checkout-button");
            if (checkoutButton) {
                checkoutButton.parentNode.removeChild(checkoutButton);
            }
        }
    };
    cartItem.appendChild(removeButton);

    var itemImage = document.createElement("img");
    itemImage.src = imageSrc;
    itemImage.alt = "";
    cartItem.appendChild(itemImage);

    var contentDiv = document.createElement("div");
    contentDiv.className = "content";

    var itemNameHeader = document.createElement("h3");
    itemNameHeader.textContent = itemName;
    contentDiv.appendChild(itemNameHeader);

    var priceDiv = document.createElement("div");
    priceDiv.className = "price";
    priceDiv.textContent = price + "/-";
    contentDiv.appendChild(priceDiv);

    var quantityInput = document.createElement("input");
    quantityInput.className = "input"
    quantityInput.type = "number";
    quantityInput.value = "1";
    quantityInput.min = "1";
    quantityInput.disabled = false; // Allow editing quantity in the cart

    // Add an event listener to prevent the input from being cleared
    quantityInput.addEventListener("input", function() {
        if (quantityInput.value === "") {
            quantityInput.value = "1";
        }
    });

    contentDiv.appendChild(quantityInput);

    cartItem.appendChild(contentDiv);

    var cartItemsContainer = document.querySelector(".cart-items-container");
    cartItemsContainer.appendChild(cartItem);

    updateCheckoutButtonVisibility();
}


//function updateCheckoutButtonVisibility() {
    var cartItemsContainer = document.querySelector(".cart-items-container");
    var checkoutButtonContainer = document.querySelector(".checkout-button-container");
    
    // Check if there are any cart items
    var cartItems = cartItemsContainer.querySelectorAll(".cart-item");
    
    // Show/hide the "Check Out" button based on whether there are items in the cart
    if (cartItems.length > 0) {
        var checkoutButton = document.querySelector(".checkout-button");
        if (!checkoutButton) {
            checkoutButton = document.createElement("span");
            checkoutButton.className = "btn checkout-button";
            checkoutButton.textContent = "Check Out";
            checkoutButton.onclick = function () {
                // Handle checkout logic here
                alert("Checking out!"); // Replace with your actual checkout code
            };
            checkoutButtonContainer.appendChild(checkoutButton);
        }
    } else {
        // No items in the cart, so remove the "Check Out" button
        var checkoutButton = document.querySelector(".checkout-button");
        if (checkoutButton) {
            checkoutButtonContainer.removeChild(checkoutButton);
        }
    }
//}

function updateCheckoutButtonVisibility() {
    var cartItemsContainer = document.querySelector(".cart-items-container");
    
    // Check if there are any cart items
    var cartItems = cartItemsContainer.querySelectorAll(".cart-item");
    
    // Remove the existing "Check Out" button
    var checkoutButton = document.querySelector(".checkout-button");
    if (checkoutButton) {
        checkoutButton.remove();
    }

    // Add a new "Check Out" button below the last cart item, if there are items in the cart
    if (cartItems.length > 0) {
        var lastCartItem = cartItems[cartItems.length - 1];
        var checkoutButtonContainer = document.createElement("div");
        checkoutButtonContainer.className = "checkout-button-container";

        var checkoutButton = document.createElement("button");
        checkoutButton.className = "checkout-button btn";
        checkoutButton.textContent = "Check Out";
        checkoutButton.onclick = function () {
            // Handle checkout logic here
            alert("Checking out!"); // Replace with your actual checkout code
        };

        checkoutButtonContainer.appendChild(checkoutButton);
        cartItemsContainer.appendChild(checkoutButtonContainer);
    }
}





