/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };
  /*
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
  };
  */
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML), //metoda "menuProduct" jest tworzona za pomocą biblioteki "Handlebars"
  };

  class Product{ //klasa, która stanowi szablon dla tworzonych instancji
    constructor(id, data){ //metoda "constructor" inicjuje nową instancje (object) i zwraca ją; przy okazji dodaje do niej właściwości oraz metody
      const thisProduct = this; //(!) referencja do instancji

      thisProduct.id = id; //e.g. cake
      thisProduct.data = data; //e.g. {class: 'small', name: "Zio Stefano's Doughnut", price: 9, etc.}

      thisProduct.renderInMenu(); //wywołanie metody po utworzeniu instancji
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      //thisProduct.processOrder();

    }

    renderInMenu(){ //metoda, która będzie renderować – czyli tworzyć – nasze produkty na stronie (elementy DOM)
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); //(!) stworzony element DOM zapisywany jest jako właściwość instancji, dzięki temu będzie dostęp do niego również w innych metodach instancji
      /* find menu container (element div with class container) */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element); //metada "appendChild" wstawia nowy element-dziecko na koniec wybranego elementu-rodzica
    }

    getElements(){ //metoda służąca odnalezieniu elementów w kontenerze produktu
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); //referencje do elementów w kontenerze produktów do wykorzystanie przez inne metody
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      }

    initAccordion(){ //rozwija/zwija część elementu
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); //szukamy trigerra w (!) nowo utworzonym elemencie-produkcie

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event){ //podajemy anonimową (nienazwaną) funkcję jako drugi argument metody - referencja do funkcji callback
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector('.product.active');
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct != null && activeProduct != thisProduct.element){ //sprawdzenie czy aktywny produkt nie jest tym, który został kliknięty
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive); //zwija produkt, usuwając klasę "active"
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm(){ //metoda odpowiedzialna za dodanie event listenerów do formularza, jego kontrolek, oraz guzika dodania do koszyka
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault(); //blokujemy domyślną akcję – wysłanie formularza z przeładowaniem strony (klawisz "enter") - to pozwoli obliczyć cenę produktu bez przeładowania strony
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){ //kontrolki formularza zawarte w elementach input i select
        input.addEventListener('change', function(){ //jeśli zaznaczono opcje to uruchamia funkcję callback
        thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault(); //blokujemy domyślną akcję – zmianę adresu strony po kliknięciu w link "Add to card"
        thisProduct.processOrder();
      });
    }

    processOrder(){ //metoda obliczająca cenę produktu za każdym razem od nowa
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form); //dostęp do formularza w formie obiektu, który zawiera zaznaczone opcje (np. olives) parametru (np. toppings) w produktcie

      // set price to default price
      let price = thisProduct.data.price; //domyślna cena produktu
      // for every category (param)...
      for(let paramId in thisProduct.data.params) { //e.g. paramId = 'toppings' - pętla "for..in" w zmiennej iteracyjnej zwraca zawsze tylko nazwę właściwości
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId]; //zapewnia dostęp do całego obiektu dostępnego pod właściwością "paramId"

        // for every option in this category
        for(let optionId in param.options) { //e.g. optionID = 'olives'
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId]; //zapewnia dostęp do całego obiektu dostępnego pod właściwością "optionId", e.g. olives: {label, price, default}
          // check if there is param with a name of paramId in formData and if it includes optionId
          if(formData[paramId] && formData[paramId].includes(optionId)){
            // check if the option is not default
            if(option.default != true) {
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
        }
      }
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
  }

  const app = { //obiekt, który pomaga w organizacji kodu aplikacji; jego rolą jest tworzenie nowych instancji i ich wykorzystywanie
    initMenu: function(){ //metoda, która pośredniczy w tworzeniu instancji wg szablonu klasy "Product", korzystajac z pobranych danych przez "initData"
      const thisApp = this;

      for(let productData in thisApp.data.products){ //pętla przechodzi po właściwościach obiektu "products", czyli cake, breakfast, itd.
        new Product(productData, thisApp.data.products[productData]); //instancję klasy tworzymy za pomocą słowa kluczowego new, nazwy klasy, oraz argumentów przekazywanych do konstruktora klasy (czyli klucz właściwości oraz wartość właściwości)
      }
    },

    initData: function(){ //metoda, która pobiera dane z obiektu "dataSource" w pliku data.js
      const thisApp = this;

      thisApp.data = dataSource; //zapisanie pobranych danych do właściwości obieku "app", zatem będą one dostępne w całym obiekcie (również dla pozostałych metod tego obiektu)
    },

    init: function(){ //metoda, która będzie uruchamiać wszystkie pozostałe komponenty strony, za pośrednictwem innych metod z obiektu "app"
      const thisApp = this;
      console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
