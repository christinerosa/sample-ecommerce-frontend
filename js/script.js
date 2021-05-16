/******************************************************************
 * Dynanamically loads featured products onto site landing page by
 * referencing the featured boolean within the product object.
 * Adds event listener to each to redirect to correct product page 
 * on click
*******************************************************************/
function loadFeaturedProducts() {
    var featuredContainer = document.querySelector(".product-card-container");
    var featuredProducts = allProducts.filter(product => product.featured == true);

    // Builds product card for each array item
    featuredProducts.forEach(product => {
        buildProductCard(product, featuredContainer);
    })

    var productCards = document.querySelectorAll(".col-4");

    // Adds event listener to all featured products
    productCards.forEach(product => {
        product.addEventListener("click", () => {
            var productId = product.querySelector(".product-card-details").key;
            // passes product id into url of the new window
            window.location.replace("product.html?" + "productId=" + productId);
        })
    })

}

/******************************************************************
 * Dynanamically loads search results based on search bar input.
 * Initates price and rating filter, as well as price sort 
 * functionality
*******************************************************************/
function loadSearchResults() {
    var searchValue = parseSearchUrl();
    var searchResults = searchProducts(searchValue);
    var searchContainer = document.querySelector(".product-card-container");
    var priceFilterSubmit = document.querySelector(".filter-btn");
    var ratingFilters = document.querySelectorAll(".stars");
    var priceSort = document.querySelectorAll(".sort");
    var filteredSearch;
    var sortedSearch;
    var filtered = false;

    if (searchResults.length == 0) { // No results found 
        var noResultsFound = document.createElement("p");
        var text = document.createTextNode("No results found.")

        noResultsFound.className = "no-results";
        searchContainer.style = "grid-template-columns: auto;"

        noResultsFound.appendChild(text);
        searchContainer.append(noResultsFound);
    } else {
        // Builds product card for each array item
        searchResults.forEach(product => {
            buildProductCard(product, searchContainer);
        })

        var productCards = document.querySelectorAll(".col-4");

        // Adds event listener to all products
        productCards.forEach(product => {
            product.addEventListener("click", () => {
                var productId = product.querySelector(".product-card-details").key;
                // passes product id into url of the new window
                window.location.replace("product.html?" + "productId=" + productId);
            })
        })
    }

    // Adds event listener to price filter "go" button
    priceFilterSubmit.addEventListener("click", () => {
        var minValue = document.querySelector("#min").value;
        var maxValue = document.querySelector("#max").value;
        var products = document.querySelectorAll(".col-4");

        filteredSearch = priceFilter(searchResults, minValue, maxValue);

        reloadPage(filteredSearch, products);
        filtered = true;
    })

    // Adds event listener to each rating filter option 
    ratingFilters.forEach(rating => {
        rating.addEventListener("click", () => {
            var products = document.querySelectorAll(".col-4");

            filteredSearch = ratingFilter(searchResults, rating.value);

            reloadPage(filteredSearch, products);
            filtered = true;
        })
    })

    // Adds event listener to price sort options
    priceSort.forEach(option => {
        option.addEventListener("click", () => {
            var products = document.querySelectorAll(".col-4");

            if (filtered) { // if products are already filtered, sort only those items by price
                sortedSearch = sortSearch(filteredSearch, option.value);
            } else { // sort all products within search results array by price
                sortedSearch = sortSearch(searchResults, option.value);
            }

            reloadPage(sortedSearch, products);
            searchResults = searchProducts(searchValue); // resets search results back to original array
        })
    })
}

/******************************************************************
 * Dynmically builds product cards (image, name, rating, & price)
*******************************************************************/
function buildProductCard(product, container) {
    var column = document.createElement("a");
    var image = document.createElement("img");
    var productDiv = document.createElement("div");
    var productName = document.createElement("h5");
    var rating = document.createElement("div");
    var price = document.createElement("p");

    column.className = "col-4";
    image.className = "product-img";
    productDiv.className = "product-card-details";
    productDiv.key = product.id;
    rating.className = "rating";

    container.append(column);
    column.append(image);
    column.append(productDiv);
    productDiv.append(productName);
    productDiv.append(rating);
    productDiv.append(price);

    image.src = product.img;
    image.alt = product.name;
    productName.innerHTML = product.name;
    price.innerHTML = "$" + product.price;

    setStarRating(product.rating, rating);
}

/******************************************************************
 * Builds star rating by dynanamically loading star icons based on  
 * the rating number set within each product object. 
*******************************************************************/
function setStarRating(numRating, ratingDiv) {
    var maxStars = 5;
    var roundedRating = Math.floor(numRating);
    var remainingStars = Math.floor(maxStars - numRating);
    var previousStar;
    var newStar;

    for (i = 0; i < numRating; i++) {
        newStar = document.createElement("i");

        if (numRating == 0.5) {
            newStar.className = "fas fa-star-half-alt"; // half-star icon
        } else {
            newStar.className = "fas fa-star"; // full star icon
        }

        if (i == 0) { // if it's the first star, add it to the ratingDiv
            ratingDiv.append(newStar);
            previousStar = newStar;
        } else { // add new star as child to previous star
            previousStar.append(newStar);
        }
    }

    if (numRating % roundedRating == 0.5) {
        newStar.className = "fas fa-star-half-alt";
        previousStar.append(newStar);
        previousStar = newStar;
    }

    /*
    * Adds empty stars for difference comparing rating to maxStars 
    * There should always be 5 star icons total
    */
    if (remainingStars > 0) {
        for (i = 0; i < remainingStars; i++) {
            newStar = document.createElement("i");
            newStar.className = "far fa-star";
            previousStar.append(newStar);
            previousStar = newStar;
        }
    }
}

/******************************************************************
 * Parses page URL for key/value pairs submitted via an HTML form.
*******************************************************************/
function parseSearchUrl() {
    var valuePairs = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (x, key, value) {
        value = value.replace("+", " ");
        valuePairs[key] = value;
    });
    return valuePairs.search;
}

/******************************************************************
 * Filters all products based on search bar input. Compares search 
 * input to the "keywords" field within each product object.
*******************************************************************/
function searchProducts(value) {
    if (value == "") { // search bar submitted with no input
        return "";
    } else {
        return allProducts.filter(product => product.keywords.includes(value.toLowerCase()));
    }
}

/******************************************************************
 * Dynamically loads individual product page using the product
 * id passed into the page's URL.
*******************************************************************/
function loadProductPage() {
    var productId = getProductId();
    var productDetails = allProducts.filter(product => product.id == productId);

    /*
    * filter creates array - grab only item (should always only be 1 - 
    * no two items should have the same product id)
    */
    productDetails = productDetails[0];

    buildImageContainer(productDetails.img, productDetails.thumbnails);
    buildDetailsContainer(productDetails.name, productDetails.rating,
        productDetails.price, productDetails.details);
}

/******************************************************************
 * Parses the page's URL and grabs the passed in product id.
*******************************************************************/
function getProductId() {
    var queryString = window.location.search;
    var params = new URLSearchParams(queryString);
    var productId = params.get("productId");
    return productId;
}

/******************************************************************
 * Dynamically builds the product image container for each
 * product page - split into thumbnails and main image.
*******************************************************************/
function buildImageContainer(mainImage, thumbnailArray) {
    var imageContainer = document.querySelector(".image-container");
    var largeImage = document.createElement("img");

    largeImage.className = "main-image";
    largeImage.src = mainImage;
    largeImage.alt = "Product Image";

    if (thumbnailArray.length != 0) {
        var thumbnailContainer = document.createElement("div");
        var thumbnailImage = document.createElement("img");

        thumbnailContainer.className = "thumbnails";

        imageContainer.append(thumbnailContainer);

        thumbnailImage.className = "small-img";
        thumbnailImage.src = mainImage;
        thumbnailImage.alt = "Product Image";
        thumbnailContainer.append(thumbnailImage);

        thumbnailArray.forEach(image => {
            thumbnailImage = document.createElement("img");
            thumbnailImage.className = "small-img";
            thumbnailImage.src = image;
            thumbnailImage.alt = "Product Image";
            thumbnailContainer.append(thumbnailImage);
        })
    } else { // if the product doesn't have any thumbnails
        largeImage.style = "margin: auto;"; // centre the main image
    }

    imageContainer.append(largeImage);

    var thumbnails = document.querySelectorAll(".small-img");

    /*
    * Adds an event listener to each thumbnail
    */
    thumbnails.forEach(image => {
        image.addEventListener("mouseover", () => { // when mouse hovers over image
            image.style = "box-shadow: 0 0 4px 2px #ff92a9;"
            largeImage.src = image.src; // main image reflects hovered over image
        })

        image.addEventListener("mouseout", () => { // when no longer hovering over image
            image.style = "box-shadow: none;" // remove box shadow
        })
    })
}

/******************************************************************
 * Dynamically builds the product detail container for each
 * product page (name, rating, price, details)
*******************************************************************/
function buildDetailsContainer(name, rating, price, details) {
    var productHeader = document.querySelector(".product-header");
    var quantity = document.querySelector("#quantity");

    var productTitle = document.createElement("h2");
    var productRating = document.createElement("div");
    var productPrice = document.createElement("p");

    productHeader.append(productTitle);
    productHeader.append(productRating);
    productHeader.append(productPrice);

    productTitle.className = "product-title";
    productTitle.innerHTML = name;
    productRating.classname = "rating";
    productPrice.innerHTML = "$" + price;

    setStarRating(rating, productRating);

    if (details.length != 0) {
        var productDetails = document.querySelector(".product-details");
        var detailList = document.createElement("ul");

        productDetails.append(detailList);

        // Adds as many list items necessary for the number of details listed in the product object "details" field
        details.forEach(detail => {
            var listItem = document.createElement("li");

            detailList.append(listItem);

            listItem.innerHTML = detail;
        })
    }

    // Adds event listener to quantity options - update price instantly on click
    quantity.addEventListener("click", () => {
        var newPrice = updatePrice(price, quantity.value);
        productPrice.innerHTML = "$" + newPrice.toFixed(2);
    })
}

/******************************************************************
 * Calculates new total price based on quantity selected. 
*******************************************************************/
function updatePrice(price, quantity) {
    return price * quantity;
}

/******************************************************************
 * Checks min and max value entered into the product price filter,
 * then filters the passed in product array based on these
 * values compared to the product object "price" field. 
*******************************************************************/
function priceFilter(products, min, max) {
    // Extra validation to ensure only integer/decimal values are accepted. 
    var isMinNumber = /^[0-9.]+$/.test(min);
    var isMaxNumber = /^[0-9.]+$/.test(max);

    if ((min != "") && (max != "")) {
        if (!isMinNumber || !isMaxNumber) { // if either value is not a number
            return products; // return original array
        }
        return products.filter(product => (product.price >= min) && (product.price <= max));
    } else if (min != "") { // if only min value is filled out
        return products.filter(product => (product.price >= min));
    } else if (max != "") { // if only max value id filled out
        return products.filter(product => (product.price <= max));
    } else { // if neither field is filled out
        return products;
    }
}

/******************************************************************
 * Filters passed in array and returns only those with a "rating"
 * field value that is greater or equal to the passed in rating.
*******************************************************************/
function ratingFilter(searchArray, rating) {
    return searchArray.filter(product => product.rating >= rating);
}

/******************************************************************
 * Sorts passed in array by price as either low to high (value 1) 
 * or high to low (value -1).
*******************************************************************/
function sortSearch(searchArray, direction) {
    if (direction == "1") {
        return searchArray.sort((p1, p2) => p1.price - p2.price);
    } else {
        return searchArray.sort((p1, p2) => p2.price - p1.price);
    }
}

/******************************************************************
 * Reloads current page, loading newly filtered/sorted products.
*******************************************************************/
function reloadPage(searchArray, products) {
    var searchContainer = document.querySelector(".product-card-container");

    // Removes old product cards
    products.forEach(product => {
        product.remove();
    })

    // Builds new product cards based on passed in array
    searchArray.forEach(product => {
        buildProductCard(product, searchContainer);
    })

    var productCards = document.querySelectorAll(".col-4");

    // Adds event listener to each product
    productCards.forEach(product => {
        product.addEventListener("click", () => {
            var productId = product.querySelector(".product-card-details").key;
            // passes product id into url of the new window
            window.location.replace("product.html?" + "productId=" + productId);
        })
    })
}

/******************************************************************
 * Dynamically loads all products on the Shop page and adds
 * filter/sort functionality there. 
*******************************************************************/
function loadShopPage() {
    var searchContainer = document.querySelector(".product-card-container");
    var priceFilterSubmit = document.querySelector(".filter-btn");
    var ratingFilters = document.querySelectorAll(".stars");
    var priceSort = document.querySelectorAll(".sort");
    var filteredSearch;
    var sortedSearch;
    var filtered = false;

    // Builds product card for all products
    allProducts.forEach(product => {
        buildProductCard(product, searchContainer);
    })

    var productCards = document.querySelectorAll(".col-4");

    // Adds event listener to each product
    productCards.forEach(product => {
        product.addEventListener("click", () => {
            var productId = product.querySelector(".product-card-details").key;
            // passes product id into url of the new window
            window.location.replace("product.html?" + "productId=" + productId);
        })
    })

    // Adds event listener to price filter "go" button
    priceFilterSubmit.addEventListener("click", () => {
        var minValue = document.querySelector("#min").value;
        var maxValue = document.querySelector("#max").value;
        var products = document.querySelectorAll(".col-4");

        filteredSearch = priceFilter(allProducts, minValue, maxValue);

        reloadPage(filteredSearch, products);
        filtered = true;
    })

    // Adds event listener to each rating filter option 
    ratingFilters.forEach(rating => {
        rating.addEventListener("click", () => {
            var products = document.querySelectorAll(".col-4");

            filteredSearch = ratingFilter(allProducts, rating.value);

            reloadPage(filteredSearch, products);
            filtered = true;
        })
    })

    // Adds event listener to price sort options
    priceSort.forEach(option => {
        option.addEventListener("click", () => {
            var products = document.querySelectorAll(".col-4");

            if (filtered) { // if products are already filtered, sort only those items by price
                sortedSearch = sortSearch(filteredSearch, option.value);
            } else { // sort all products within search results array by price
                sortedSearch = sortSearch(allProducts, option.value);
            }

            reloadPage(sortedSearch, products);
            searchResults = searchProducts(searchValue); // resets search results back to original array
        })
    })
}