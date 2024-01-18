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

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML), //metoda "menuProduct" jest tworzona za pomocą biblioteki "Handlebars"
  };

  class Product{ //klasa, która stanowi szablon dla tworzonych instancji
    constructor(id, data){ //metoda "constructor" inicjuje nową instancje (object) i zwraca ją; przy okazji dodaje do niej właściwości oraz metody
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu(); //wywołanie metody po utworzeniu instancji
      thisProduct.initAccordion();
    }

    renderInMenu(){ //metoda, która będzie renderować – czyli tworzyć – nasze produkty na stronie (elementy DOM)
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); //stworzony element DOM zapisywany jest jako właściwość instancji, dzięki temu będzie dostęp do niego również w innych metodach instancji
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element); //metada "appendChild" wstawia nowy element-dziecko na koniec wybranego elementu-rodzica
    }

    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); //szukamy trigerra w (!) nowo utworzonym elemencie-produkcie

      /* START: add event listener to clickable trigger on event click */
      clickableTrigger.addEventListener('click', function(event){ //podajemy anonimową (nienazwaną) funkcję jako drugi argument metody - referencja do funkcji callback
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
