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

  class Product{ //pusta klasa zawierająca konstruktor
    constructor(id, data){ //metoda "constructor" inicjuje nową instancje (object) i zwraca ją; przy okazji dodaje do niej właściwości oraz metody
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      console.log('new Product:', thisProduct);
    }

    renderInMenu(){ //metoda, która będzie renderować – czyli tworzyć – nasze produkty na stronie
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); //stworzony element DOM zapisywany jest jako właściwość instancji, dzięki temu będzie dostęp do niego również w innych metodach instancji
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
  }

  const app = { //obiekt, który pomaga w organizacji kodu aplikacji; jego rolą jest tworzenie nowych instancji i ich wykorzystywanie
    initMenu: function(){ //metoda, która pośredniczy w tworzeniu instancji wg szablonu klasy "Product"
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){ //pętla przechodzi po właściwościach obiektu "products", czyli cake, breakfast, itd.
        new Product(productData, thisApp.data.products[productData]); //instancję klasy tworzymy za pomocą słowa kluczowego new, nazwy klasy, oraz argumentów przekazywanych do konstruktora klasy (czyli nazwę właściwości oraz wartość)
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource; //pobranie danych z obiektu "dataSource" w pliku data.js
    },

    init: function(){ //metoda, która będzie uruchamiać wszystkie pozostałe komponenty strony, za pośrednictwem innych metod z obiektu "app"
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
