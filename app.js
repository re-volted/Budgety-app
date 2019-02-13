// ---------------------------------------
var budgetController = (function () {

   var Expense = function (id, desc, value) {
      this.id = id;
      this.desc = desc;
      this.value = value;
      this.percentage = -1;
   };

   Expense.prototype.calcPercentage = function (totalIncome) {
      if (totalIncome > 0) {
         this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
         this.percentage = -1;
      }
   }

   Expense.prototype.getPercentage = function () {
      return this.percentage;
   }

   var Income = function (id, desc, value) {
      this.id = id;
      this.desc = desc;
      this.value = value;
   };

   var data = {
      allItems: {
         exp: [],
         inc: []
      },
      totals: {
         exp: 0,
         inc: 0
      },
      budget: 0,
      percentage: -1
   }

   var calculateTotal = function (type) {
      var sum = 0;
      data.allItems[type].forEach(el => {
         sum += el.value;
      });
      data.totals[type] = sum;
   }

   return {
      addItem(type, desc, value) {
         var newItem, ID;

         // Determining new ID as the ID of the last element of current type +1
         if (!data.allItems[type].length) {
            ID = 0;
         } else {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
         }

         // Creating new item based on 'exp' or 'inc'
         if (type === "exp") {
            newItem = new Expense(ID, desc, value);
         } else if (type === "inc") {
            newItem = new Income(ID, desc, value);
         }

         // Adding new item to allItems array
         data.allItems[type].push(newItem);

         // Returning the new item
         return newItem;
      },

      deleteItem(type, id) {
         var ids, index;

         ids = data.allItems[type].map(el => el.id)

         index = ids.indexOf(id);

         if (index !== -1) {
            data.allItems[type].splice(index, 1);
         }
      },

      calculateBudget() {

         calculateTotal('exp');
         calculateTotal('inc');

         data.budget = data.totals.inc - data.totals.exp;
         if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
         } else {
            data.percentage = -1;
         }

      },

      calculatePercentages() {
         data.allItems.exp.forEach(exp => {
            exp.calcPercentage(data.totals.inc);
         })
      },

      getPercentages() {
         var allPerc = data.allItems.exp.map(exp => {
            return exp.getPercentage();
         })
         return allPerc;
      },

      getBudget() {
         return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
         };
      },

      testing() {
         console.log(data);
      }
   }
})();







// ---------------------------------------
var UIController = (function () {

   var DOMstrings = {
      inputType: '.add__type',
      inputDesc: '.add__description',
      inputValue: '.add__value',
      inputBtn: '.add__btn',
      incomeContainer: '.income__list',
      expensesContainer: '.expenses__list',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expensesLabel: '.budget__expenses--value',
      percentageLabel: '.budget__expenses--percentage',
      container: '.container',
      expencesPercLabel: '.item__percentage',
      dateLabel: '.budget__title--month'
   };

   var formatNumber = function (num, type) {
      var numSplit, int, dec;

      // deleting sign in front of the number
      num = Math.abs(num);

      // putting exactly 2 decimal numbers after the number
      num = num.toFixed(2);

      // splitting number into int and dec part
      numSplit = num.split('.');

      int = numSplit[0];
      dec = numSplit[1];

      if (int.length > 3) {
         int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
      }

      ;

      return `${(type === 'exp') ? '-' : '+'} ${int}.${dec}`
   };

   // custom forEach function for nodeList
   var nodeListForEach = function (list, callback) {
      for (var i = 0; i < list.length; i++) {
         callback(list[i], i);
      }
   };

   return {
      getInput() {
         return {
            type: document.querySelector(DOMstrings.inputType).value, // will be inc or exp
            description: document.querySelector(DOMstrings.inputDesc).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
         }
      },

      addListItem(obj, type) {
         var html, newHtml, element;

         // Create HTML sring with placeholder text
         if (type === "inc") {
            element = DOMstrings.incomeContainer;
            html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
         } else if (type === "exp") {
            element = DOMstrings.expensesContainer;
            html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
         }

         // Replace placeholder with real data
         newHtml = html.replace('%id%', obj.id);
         newHtml = newHtml.replace('%description%', obj.desc);
         newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

         // Insert into DOM
         document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
      },

      deleteListItem(selectorID) {
         var el = document.getElementById(selectorID);
         el.parentNode.removeChild(el);
      },

      clearFields() {
         var fields, fieldsArr;

         // fields = document.querySelectorAll(DOMstrings.inputDesc + ", " + DOMstrings.inputValue); // one solution, using rest
         // fieldsArr = [...fields];

         fields = document.querySelectorAll(DOMstrings.inputDesc + ", " + DOMstrings.inputValue); // second solution, using slice and call method
         fieldsArr = Array.prototype.slice.call(fields);

         fieldsArr.forEach(el => {
            el.value = "";
         });

         fieldsArr[0].focus();
      },

      displayBudget(obj) {
         var type;
         obj.budget >= 0 ? type = 'inc' : type = 'exp';

         document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
         document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
         document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

         if (obj.percentage > 0) {
            document.querySelector(DOMstrings.percentageLabel).textContent = `${obj.percentage}%`;
         } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = `---`;
         }
      },

      displayPercentages(percentages) {
         var fields = document.querySelectorAll(DOMstrings.expencesPercLabel);

         nodeListForEach(fields, (current, index) => {
            if (percentages[index] > 0) {
               current.textContent = percentages[index] + '%';
            } else {
               current.textContent = "---";
            }
         })
      },

      displayMonth() {
         var now, year, month;

         now = new Date();
         year = now.getFullYear();
         month = now.getMonth();

         months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

         document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
      },

      changedType() {
         var fields = document.querySelectorAll(
            DOMstrings.inputType + ',' +
            DOMstrings.inputDesc + ',' +
            DOMstrings.inputValue
         );

         nodeListForEach(fields, el => {
            el.classList.toggle('red-focus');
         });

         document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

      },

      getDOMstrings() {
         return DOMstrings;
      }
   }
})();







// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var controller = (function (budgetCtrl, UICtrl) {

   var setupEventListeners = function () {
      var DOM = UICtrl.getDOMstrings();

      document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

      document.addEventListener('keypress', function (e) {
         if (e.keyCode === 13 || e.which === 13) {
            ctrlAddItem();
         };
      });

      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
   }

   var updateBudget = function () {
      var budget;
      // 1. calculate the budget
      budgetCtrl.calculateBudget();

      // 2. return the budget
      budget = budgetCtrl.getBudget();

      // 3. display the budget on the UI
      UICtrl.displayBudget(budget);
   }

   var updatePercentages = function () {
      var percentages;

      // 1. calculate the percentages
      budgetCtrl.calculatePercentages();

      // 2. read them from budget controller
      percentages = budgetCtrl.getPercentages();

      // 3. update the UI
      UICtrl.displayPercentages(percentages);

   }

   var ctrlAddItem = function () {
      var input, newItem;

      // 1. getting input data
      input = UICtrl.getInput();

      if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {
         // 2. adding the item to the budget controller
         newItem = budgetCtrl.addItem(input.type, input.description, input.value);

         // 3. adding item to UI
         UICtrl.addListItem(newItem, input.type);

         // 4. clearing input fields
         UICtrl.clearFields();

         // 5. calculate and update the budget
         updateBudget();

         // 6. calculate & update percentages
         updatePercentages();
      }
   };

   var ctrlDeleteItem = function (e) {
      var itemID, splitID, type, ID;

      // traversing DOM to reach whole list item
      itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

      if (itemID) {

         splitID = itemID.split('-');
         type = splitID[0];
         // have to parse ID as it came from string into another string but is a number
         ID = parseInt(splitID[1]);

         // 1. delete item from data structure
         budgetCtrl.deleteItem(type, ID);

         // 2. delete item from UI
         UICtrl.deleteListItem(itemID);

         // 3. calculate and update the budget
         updateBudget();

         // 4. calculate and update percentages
         updatePercentages();
      }


   }

   return {
      init() {
         console.log('App started.');
         UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
         });

         UICtrl.displayMonth();
         setupEventListeners();
      },
   }
})(budgetController, UIController);

controller.init();