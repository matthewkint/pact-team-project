let items;
let cart = [];
$(window).on('load', () => {
  const $main = $('main');
  /**
   * On each load, we send a get request to get all the product info and display it on the page.
   */
  $.get('/api/products', (data) => {
    items = data;
    for (i = 0; i < data.length; i++) {
      let $item = $('<div/>').attr('class', 'items shadow');
      $item.append(`<img src='../img/${data[i].img}' alt='${data[i].name} Image'>`);
      let $desc = $('<div/>').attr('class', 'description');
      $desc.append(`<h2>${data[i].name}</h2>`);
      $desc.append(`<p>${data[i].description}</p>`);
      let $cartInfo = $('<div/>').attr('class', 'cart-info');
      $cartInfo.append(`<p class='cost'>Cost: $${data[i].cost.toFixed(2)}</p>`);
      let $cartButtons = $('<div/>').attr('class', 'cart-buttons');
      $cartButtons.append(`<input type='number' min='0' max='10' value='0'>`);
      $cartButtons.append(`<button onclick='addToCart(${i})'>Add to Cart</button>`);
      $cartInfo.append($cartButtons);
      $desc.append($cartInfo);
      $item.append($desc);
      $main.append($item);
    }
    /**
     * Each time user loads this page, we send a get request to get cart items. If there are any, 
     * we render them on in the totals section
     */
    $.get('/api/user', (data) => {
      if (data) {
        for (let i = 0; i < data.length; i++) addToCart(data[i].itemIndex, data[i].qty);
      }
    });
  });

  
});

/**
 * Adds an item to cart, if amount not provided, we get the amount from the input
 */
const addToCart = (index, amount=null) => {
  if (!amount) amount = Number($(`.cart-info input`)[index].value);
  if (amount < 1) return;
  $(`.cart-info input`)[index].value = 0;
  // We try to find the added item in the cart, if item is already in the cart, we simply add quantity to it and update totals
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].itemIndex == index) {
      cart[i].qty += amount;
      $('.total table input')[i].value = cart[i].qty;
      $('.total table tr td:nth-child(4)')[i].innerHTML = `$${(cart[i].qty * items[cart[i].itemIndex].cost).toFixed(2)}`;
      updateTotals();
      return;
    }
  }
  // Add item to cart and render row in the table for item, update totals
  cart.push({qty: amount, itemIndex: index});
  let $table = $('.total table');
  let $item = $(`<tr><td><a href='#' onclick='deleteFromCart(${index});return false;'>X</a></td><td>${items[index].name}</td><td><input type='number' class='quantity' min='1' max='10' value='${amount}' oninput='updatePrice(${index})'></td><td>$${(items[index].cost * amount).toFixed(2)}</td></tr>`);
  $table.append($item);
  updateTotals();
}

/**
 * update price, simply updates the price * qty of a single item and calls update total
 */
const updatePrice = (itemIndex) => {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].itemIndex == itemIndex) {
      cart[i].qty = Number($('.total table input')[i].value);
      $('.total table tr td:nth-child(4)')[i].innerHTML = `$${(cart[i].qty * items[itemIndex].cost).toFixed(2)}`;
      updateTotals();
      break;
    }
  }
}

/**
 * Removes item from cart and remove it from DOM, updates total
 */
const deleteFromCart = (itemIndex) => {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].itemIndex == itemIndex) {
      $(`.total table tr:nth-child(${i + 2})`).remove();
      cart.splice(i, 1);

      updateTotals();
      break;
    }
  }
}

/**
 * Updates total based on what is in cart, calculates taxes, and sends a post request for server to remember what is new
 * in the cart
 */
const updateTotals = () => {
  let totalItemsCost = 0; 
  for (let i = 0; i < cart.length; i++) {
    totalItemsCost += cart[i].qty * items[cart[i].itemIndex].cost;
  }
  let taxCost = totalItemsCost * 0.056;
  let totalCost = totalItemsCost + taxCost;
  $('.total-bill p:nth-child(2)').html(`Items: $${totalItemsCost.toFixed(2)}`);
  $('.total-bill p:nth-child(3)').html(`Tax: $${taxCost.toFixed(2)}`);
  $('.total-bill h4').html(`$${totalCost.toFixed(2)}`);
  $.post('/api/user', JSON.stringify(cart));
}
