/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

//const { name } = require("browser-sync");

{
  'use strict';
  /* *********************************************************************************************************************************************************************************************************************************************************************************** */
  const select = {  //(!) referencje do elementów DOM
    templateOf: {
      menuProduct: "#template-menu-product",
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: { //CODE ADDED START: konfguracja parametrów, które są potrzebne do łączenia się z API
      url: '//localhost:3131', //link do serwera API
      products: 'products', //link do kolekcji /products
      orders: 'orders', //link do kolekcji /orders
      }, //CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML), //metoda "menuProduct" jest tworzona za pomocą biblioteki "Handlebars"
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML), // CODE ADDED
  };
  /* *********************************************************************************************************************************************************************************************************************************************************************************** */
  class Product{ //klasa, która stanowi szablon dla tworzonych instancji-produktu
    constructor(id, data){ //metoda "constructor" inicjuje nową instancje (object) i zwraca ją; przy okazji dodaje do instancji właściwości oraz wywołuje dla niej metody
      const thisProduct = this; //(!) referencja do instancji

      thisProduct.id = id; //e.g. cake - dodanie właściwości do instancji
      thisProduct.data = data; //e.g. {class: 'small', name: "Zio Stefano's Doughnut", price: 9, etc.}

      thisProduct.renderInMenu(); //wywołanie metody po utworzeniu instancji
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initAmountWidget(); //new
      thisProduct.initOrderForm();
      thisProduct.processOrder()
    }

    renderInMenu(){ //(!) metoda, która będzie renderować – czyli tworzyć – nasze produkty na stronie (elementy DOM)
      const thisProduct = this;

      // create dom object storing references to DOM elements
      thisProduct.dom = {}; //w obiekcie przechowywane są referencje do elementów DOM
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data); //wstawianie kodu HTML do szablonu HANDLEBARS
      /* create element using utils.createElementFromHTML */
      thisProduct.dom.element = utils.createDOMFromHTML(generatedHTML); //(!) stworzony element DOM zapisywany jest do właściwości instancji "Product", dzięki temu będzie dostęp do niego również w innych metodach instancji
      /* find menu container (element div with class container) */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.dom.element); //metada "appendChild" wstawia nowy element-dziecko na koniec wybranego elementu-rodzica
    }

    getElements(){ //metoda służąca odnalezieniu elementów DOM; przypisuje referencje do elementów znajdujących się w kontenerze "element"
      const thisProduct = this;

      thisProduct.dom.accordionTrigger = thisProduct.dom.element.querySelector(select.menuProduct.clickable); //zapisanie we właściwościach instancji referencji do elementów w kontenerze produktu, aby móc z nich korzystać w innych metodach; (!) danej referencji szukamy w kontenerze pojedynczego produktu ("thisProduct.dom.element") a nie w całym dokumencie ("document")
      thisProduct.dom.form = thisProduct.dom.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.dom.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.dom.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.dom.element.querySelector(select.menuProduct.imageWrapper);

      thisProduct.dom.amountWidgetElem = thisProduct.dom.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){ //rozwija/zwija część elementu
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.dom.element.querySelector(select.menuProduct.clickable); //szukamy trigerra w (!) nowo utworzonym elemencie-produkcie

      /* START: add event listener to clickable trigger on event click */
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event){ //podajemy anonimową (nienazwaną) funkcję jako drugi argument metody - referencja do funkcji callback
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector('.product.active');
        /* if there is active product and it's not thisProduct.dom.element, remove class active from it */
        if (activeProduct != null && activeProduct != thisProduct.dom.element){ //sprawdzenie czy aktywny produkt nie jest tym, który został kliknięty
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive); //zwija produkt, usuwając klasę "active"
        }
        /* toggle active class on thisProduct.dom.element */
        thisProduct.dom.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm(){ //metoda odpowiedzialna za dodanie event listenerów do formularza, jego kontrolek, oraz guzika dodania do koszyka
      const thisProduct = this;

      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault(); //blokujemy domyślną akcję – wysłanie formularza z przeładowaniem strony (klawisz "enter") - to pozwoli obliczyć cenę produktu bez przeładowania strony
        thisProduct.processOrder();
      });

      for(let input of thisProduct.dom.formInputs){ //kontrolki formularza zawarte w elementach input i select
        input.addEventListener('change', function(){ //jeśli zaznaczono opcje to uruchamia funkcję callback
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function(event){ //button "ADD TO CART"
        event.preventDefault(); //blokujemy domyślną akcję – zmianę adresu strony po kliknięciu w link "Add to card"
        thisProduct.processOrder();
        thisProduct.addToCart(); //uruchamia metodę, która przekazuje referencję do obiektu "productSummary" jako argument metody "add()" klasy "Cart"
      });
    }

    processOrder(){ //metoda obliczająca cenę produktu za każdym razem od nowa; dodatkowo obsługuje pojawiwanie się grafiki z uwzględnieniem zaznaczonych opcji
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form); //dostęp do formularza w formie obiektu, który zawiera zaznaczone opcje (np. olives) parametru (np. toppings) dla produktu

      // set price to default price
      let price = thisProduct.data.price; //domyślna cena produktu

      // for every category (param)...
      for(let paramId in thisProduct.data.params) { //e.g. paramId = 'toppings' - pętla "for..in" w zmiennej iteracyjnej zwraca zawsze tylko nazwę właściwości
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId]; //zapewnia dostęp do całego obiektu dostępnego pod właściwością "paramId"

        // for every option in this category
        for(let optionId in param.options) { //e.g. optionId = 'olives'
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId]; //zapewnia dostęp do całego obiektu dostępnego pod właściwością "optionId", e.g. olives: {label, price, default}
          // check if there is param with a name of paramId in formData and if it includes optionId
          if(formData[paramId] && formData[paramId].includes(optionId)){ //sprawdzenie, czy zaznaczono opcje - czy obiekt "optionId" jest zawarty w obiekcie "paramId"
            // check if the option is not default
            if(option.default != true){  //uwaga: jeśli obiekt nie ma właściwości "default", to wyrażenie jest prawdzie, ponieważ "undefined" nie jest równe "true"
            // add option price to price variable
            price += option.price;
            }
          } else {
            // check if the option is default
            if(option.default == true) {
            // reduce price variable
            price -= option.price;
            }
          }
          // find image fitted to param-option pair e.g. sauce-tomato
          const optionImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId); //(!)sam to wymyśliłem
          // check if image was found
          if(optionImage){
            // check if there is param with a name of paramId in formData and if it includes optionId
            if(formData[paramId] && formData[paramId].includes(optionId)){
              // add class active to optionImage
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              // remove class active from optionImage
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      // update calculated price (amount = 1) in the JS
      thisProduct.priceSingle = price;
      // multiply price by amount
      price *= thisProduct.amountWidget.value;
      // update calculated price in the HTML
      thisProduct.dom.priceElem.innerHTML = price;
    }

    initAmountWidget(){ //metoda odpowiedzialna za utworzenie nowej instancji klasy "AmountWidget"
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem, settings.amountWidget.defaultValue); //utworzenie instancji klasy "AmountWidget"; przypisanie do właściwości instancji "Product" referencji do instancji "AmountWidget"

      thisProduct.dom.amountWidgetElem.addEventListener('updated', function(event){ //nasłuchiwanie customowego obiekt-eventu 'updated', który informuje instancje "Product" o zmianie wartości w widget
        event.preventDefault();
        thisProduct.processOrder(); //wywołanie metody, która przeliczy cenę, gdy się dowie o zmianie ilości sztuk
      });
    }

    addToCart(){ //przesyła dane zamawianego produktu
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct()); //wywołanie metody "add()" z referencją do obiektu "productSummary"
    }

    prepareCartProduct(){ //zapisuje dane zamawianego produktu
      const thisProduct = this;

      const productSummary = {}; //obiekt, który posiada niezbędne dane dla koszyka
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.name = thisProduct.data.name;
      productSummary.priceSingle = thisProduct.priceSingle; //cena jednostkowa
      productSummary.params = thisProduct.prepareCartProductParams(); //zawiera kategorie (e.g. "toppings") i opcje (e.g. "olives") zamówionego produktu
      productSummary.id = thisProduct.id;
      productSummary.price = productSummary.priceSingle * productSummary.amount; //cena całkowita

      return productSummary;
    }

    prepareCartProductParams(){ //przygotowuje obiekt podsumujący wybrane opcje zamówionego produktu
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.dom.form); //dostęp do formularza w formie obiektu, który zawiera zaznaczone opcje
      const params = {}; //zawiera kategorie (e.g. "toppings") i opcje (e.g. "olives") zamówionego produktu
      // for every category (param)...
      for(let paramId in thisProduct.data.params) { //e.g. paramId = 'toppings' - pętla "for..in" w zmiennej iteracyjnej zwraca zawsze tylko nazwę właściwości
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId]; //zapewnia dostęp do całego obiektu dostępnego pod właściwością "paramId", e.g. toppings: {label: 'Toppings', type: 'checkboxes', options: {}}
        // create category "paramId" in "params" const eg. params = { toppings: { label: 'Toppings', options: {}}}
        params[paramId] = { //(!) po każdej iteracji pętli zewnętrznej dodawany jest obiekt "paramId" do obiektu "params"
          label: param.label,
          options: {}
        }
        // for every option in this category
        for(let optionId in param.options) { //e.g. optionId = 'olives'
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId]; //zapewnia dostęp do całego obiektu dostępnego pod właściwością "optionId", e.g. olives: {label, price, default}
          // check if there is param with a name of paramId in formData and if it includes optionId
          if(formData[paramId] && formData[paramId].includes(optionId)){ //sprawdzenie, czy zaznaczono opcje - czy właściwość "optionId" jest zawarta w obiekcie "paramId"
            // create option "optionId" in "options" object
            params[paramId].options[optionId] = option.label; //(!) po każdej iteracji pętli wewnętrznej dodawana jest właściwosć "optionId" do obiektu "options"
          }
        }
      }
      return params;
    }
  }
  /* *********************************************************************************************************************************************************************************************************************************************************************************** */
  class AmountWidget{ //widget (element interfejsu graficznego) wyboru ilości produktów - jego rolą jest nadanie życia inputowi i buttonom liczbowym, tak aby informowały o swoim działaniu inne elementy
    constructor(element,  value){ //argumentem jest referencja do widgetu zmiany ilości
      const thisWidget = this;

      thisWidget.getElements(element); //przekazanie argumentu "element" dalej, jako argument kolejnej metody
      thisWidget.setValue(value); //wywołanie metody, która ustawi domyślną wartość inputu (czyli "settings.amountWidget.defaultValue" lub "thisCartProduct.amount")
      thisWidget.initActions(); //dodanie reakcji na eventy dla input oraz buttonów "+" i "-", czyli zmiana ilości produktu
    }

    getElements(element){ //metoda służąca odnalezieniu trzech elementów widgetu - inputu i dwóch buttonów
      const thisWidget = this;

      thisWidget.dom = {}; //w obiekcie przechowywane są referencje do elementów DOM
      thisWidget.dom.element = element; //przypisanie do właściwości instancji "AmountWidget" referencji do kontenera widgetu
      thisWidget.dom.input = thisWidget.dom.element.querySelector(select.widgets.amount.input);
      thisWidget.dom.linkDecrease = thisWidget.dom.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.dom.linkIncrease = thisWidget.dom.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){ //metoda będzie uruchamiana przy próbie zmiany wartości (w input) i decydować, czy ma na to pozwolić, czy może przywrócić starą (ostatnią dobrą) wartość
      const thisWidget = this;

      const newValue = parseInt(value); //przekonwertowanie przekazanego argumentu na liczbę, ponieważ input zwraca wartość w formacie tekstowym
      /* Add validation */
      if(thisWidget.value !== newValue && !isNaN(newValue)) { //sprawdza, czy wartość, która jest już aktualnie w "thisWidget.value" jest inna niż wartość, która przychodzi do funkcji "newValue" oraz czy "newValue" nie jest tekstem; operator "!==" oznacza różne wartości i typy danych
        if(newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
          thisWidget.value = newValue; //ustawienie wartości ilości sztuk produktu
        }
      }

      thisWidget.dom.input.value = thisWidget.value; //aktualizowanie wartości dla właściwości "value" w input

      thisWidget.announce(); //wywołanie metody, która wysyła customowy event-obiekt z informacją o ustawieniu wartości
    }

    initActions(){
      const thisWidget = this;

      thisWidget.dom.input.addEventListener('change', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.dom.input.value);
      });

      thisWidget.dom.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.dom.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce(){ //metoda, która tworzy instancje (obiekt-event) klasy "Event" wbudowanej w przeglądarkę - dzięki temu "AmountWidget" będzie informował inne elementy (np. instancje "Product") o zmianie ilości
      const thisWidget = this;

      const event = new CustomEvent('updated', { //"update" to nazwa customowego eventu
        bubbles: true // włączenie właściwości "bubbles": obiekt-event bąbelkuje (emituje) w górę po wszystkich elementach (a nie tylko po elemencie na, którym jest odpalany)
      });

      thisWidget.dom.element.dispatchEvent(event); //metoda "dispatchEvent", odpalana na "thisWidget.dom.element," wysyła obiekt-event do "event listenera" z informacją o ustawieniu wartości w widget
    }
  }
  /* *********************************************************************************************************************************************************************************************************************************************************************************** */
  class Cart{ //obsługuje cały koszyk i wszystkie jego funkcjonalności
    constructor(element){ //argumentem jest referencja do konteneru koszyka
      const thisCart= this;

      thisCart.products = []; //(!) w tablicy przechowywane są produkty (instancje klasy "CartProduct") dodane do koszyka
      thisCart.getElements(element);
      thisCart.initActions();

    }

    getElements(element){ //znajduje elementy znajdujące się w kontenerze koszyka
      const thisCart = this;

      thisCart.dom = {}; //w obiekcie przechowywane są referencje do elementów DOM
      thisCart.dom.wrapper = element; //zapisanie do właściwości referencji do konteneru koszyka (id="cart")

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger); //przypisanie do właściwości referencji do znalezionego elementu "toggleTrigger" w kontenerze koszyka "wrapper"
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); //(!) referencja do listy zamówionych produktów, wygenerowanej po kliknięciu w "ADD TO CART"
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice); //(!) zapisanie do tablicy referencja do dwóch elementów pokazującychy cenę końcową (total price)
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form); //new
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone); //new
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address); //new
    }

    initActions(){ //rozwija/zwija koszyk
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){ //nasłuchiwanie nagłówka koszyka (elementu o id="cart")
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){ //nasłuchiwanie "productList", w której umieszczone są produkty "CartProduct", w którch jest widget "amountWidget", który generuje event
        thisCart.update(); //ponowne przelicznie kwoty
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.delete(event.detail.cartProduct); //przekazanie jako argument referencji do instancji "thisCartProduct"
      });

      thisCart.dom.form.addEventListener('submit', function(event){ //nasłuchiwanie przycisku "ORDER" w koszyku
        event.preventDefault();
        thisCart.sendOrder();
      });

    }

    add(menuProduct){ //dodaje dane zamawianego produktu do koszyka; argument "menuProduct" zawiera referencję do obiektu "productSummary"
      const thisCart = this;

      /* generate HTML based on template using "templates.cartProduct" */
      const generatedHTML = templates.cartProduct(menuProduct);
      /* create element using "utils.createElementFromHTML" */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      /* add element to cart wrapper using "appendChild" */
      thisCart.dom.productList.appendChild(generatedDOM); //dodanie nowego elementu DOM na koniec kontenera koszyka

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM)); //utworzenie oraz dodanie instancji klasy "CartProduct" do tablicy
      thisCart.update();
    }

    delete(cartProduct){
      const thisCart = this;
      // remove cartProduct HTML (DOM element)
      cartProduct.dom.wrapper.remove();
      //remove cartProduct reference form thisCart.products array
      const indexOfcartProudct = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(indexOfcartProudct, 1);
      //run update()
      thisCart.update();
    }

    update(){ //przechodzi po wszyskich produktach w koszyku i sumuje kwoty
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0; //całościowa liczba sztuk produktów
      thisCart.subtotalPrice = 0; //zsumowana cena wszystkich produktów

      for(let product of thisCart.products){ //iterowanie po wszystkich produktach w koszyku
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }

      if(thisCart.totalNumber > 0){ //sprawdzenie, czy zawartość koszyka nie jest pusta
        thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee; //doliczenie opłaty za wysyłkę i zapisanie jej do właściwości "totalPrice" (mogą z niej korzystać inne metody)
        thisCart.deliveryFee = deliveryFee;

        thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
        thisCart.dom.totalPrice[0].innerHTML = thisCart.totalPrice;
        thisCart.dom.totalPrice[1].innerHTML = thisCart.totalPrice;
      } else {
        thisCart.totalPrice = thisCart.subtotalPrice;
        thisCart.deliveryFee = 0;

        thisCart.dom.deliveryFee.innerHTML = 0;
        thisCart.dom.totalPrice[0].innerHTML = thisCart.totalPrice;
        thisCart.dom.totalPrice[1].innerHTML = thisCart.totalPrice;
      }

      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    }

    sendOrder(){ //wysyła dane zamówienia na serwer
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders; //adres endpointu

      const payload = { //obiekt z danymi zamówienia do wysłania na serwer (tzw. ładudenk)
        address: thisCart.dom.address.value,
        phone: thisCart.dom.address.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [] //tablica obecnych w koszyku produktów
      };

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const options = { //opcje konfigurujące request (zapytanie)
        method: 'POST', //metoda służąca do wysylania danych na serwer
        headers: {
          'Content-Type': 'application/json', //poinformowanie serwera o tym, że dane przesyłane są w formie JSON
        },
        body: JSON.stringify(payload), //body - wysyłana treść; przekonwertowanie obiektu "payloud" na postać JSON
      };

      fetch(url, options); //wysłanie zapytania do serwera
    }
  }
  /* *********************************************************************************************************************************************************************************************************************************************************************************** */
  class CartProduct{ //obsługuje pojedyncze produkty, które znajdują się w koszyku
    constructor(menuProduct, element){ //arg1 - referencja do "productSummary", arg2 - referencja do "generatedDOM"
      const thisCartProduct= this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }

    getElements(element){
      const thisCartProduct= this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element; //przypisanie referencji do "generatedDOM"
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    getData(){ //przygotowuje obiekt posiadający niektóre właściwości instancji "CartProduct" potrzebne do wysłania na serwer
      const thisCartProduct = this;

      const cartProductSummary = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        name: thisCartProduct.name,
        params: thisCartProduct.params
      };

      return cartProductSummary;
    }

    initAmountWidget(){
      const thisCartProduct= this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget, thisCartProduct.amount); //utworzenie instancji klasy "AmountWidget"; przypisanie do właściwości "amountWidget" referencji do instancji "AmountWidget"

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(event){ //nasłuchiwanie customowego obiekt-eventu 'updated', który informuje instancje "CartProduct" o zmianie wartości w widget
        event.preventDefault();
        thisCartProduct.amount = thisCartProduct.amountWidget.value; //przypisanie aktulnej wartości (czyli liczby sztuk) pobranej z właściwości "value" instancji "AmountWidget"
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price; //zaktualizowanie wartości elementu HTML
      });
    }

    delete(){ //usuwa produkt z koszyka
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: { //informacje, które są przekazywane wraz z eventem
          cartProduct: thisCartProduct, //referencja do instancji, dla której kliknięto "remove"
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();

      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.delete();
      });
    }
  }
  /* *********************************************************************************************************************************************************************************************************************************************************************************** */
  const app = { //obiekt, który pomaga w organizacji kodu aplikacji; jego rolą jest tworzenie nowych instancji i ich wykorzystywanie
    initMenu: function(){ //metoda, która pośredniczy w tworzeniu instancji wg szablonu klasy "Product", korzystajac z pobranych danych przez "initData"
      const thisApp = this;

      for(let productData in thisApp.data.products){ //pętla przechodzi po właściwościach (a konkretnie po kluczach "productData") obiektu "products", czyli cake, breakfast, itd.
        //new Product(productData, thisApp.data.products[productData]); //instancję klasy tworzymy za pomocą słowa kluczowego new, nazwy klasy, oraz argumentów przekazywanych do konstruktora klasy (czyli klucz właściwości oraz wartość właściwości)
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initData: function(){ //metoda, która pobiera dane z obiektu "dataSource" w pliku data.js
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products; //adres endpointu, pod którym serwer API udostępnia dane (listę produktów)

      fetch(url) //(!) wysłanie zapytania (request) do serwera API pod podany adres endpointu
        .then(function(rawResponse){ //funkcja schowana w metodzie "then" jest uruchamiana wtedy, gdy request się zakończy, a serwer API zwróci odpowiedź
          return rawResponse.json(); //surowa opdowiedź (rawresponse), w formacie JSON, jest konwertowana na obiekt JS-owy
        })
        .then(function(parsedResponse){ //skonwertowana odpowiedź (parsedResponse) wyświetlana jest w konsoli
          // save parsedResponse as thisApp.data.products
          thisApp.data.products = parsedResponse; //pobrane dane z serwera zapisywane są da do właściwości obieku "app", zatem będą one dostępne w całym obiekcie (również dla pozostałych metod tego obiektu)
          // execute initMenu method
          thisApp.initMenu(); //uruchowmienie metody następuje po otrzymaniu danych (listy produktów) z serwera
        });
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart); //wyszukuje kontener koszyka (id="cart")
      thisApp.cart = new Cart(cartElem); //referencja do instancji "Cart" jest zapisana do "thisApp.cart"
    },

    init: function(){ //metoda, która będzie uruchamiać wszystkie pozostałe komponenty strony, za pośrednictwem innych metod z obiektu "app"
      const thisApp = this;

      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init(); //załadowanie strony/aplikacji
}
