'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Display the money properly
const displayMovements = function (movements, sort = false) {
  // removes the values that were there initially.
  containerMovements.innerHTML = '';

  // if sort, create a copy of the movements array and sort that, not the original array itself. slice copies it
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
            <div class="movements__row">
                <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
                <div class="movements__value">${mov}€</div>
            </div>
        
        `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

// displays summary on the bottom for incoming money
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    // exclude interests that are below 1
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = `${interest}€`;
};

// compute the usernames properly
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(function (name) {
        return name[0];
      })
      // can be rewritten as:  .map(name => name[0]);
      .join('');
  });
};

createUsernames(accounts);
// console.log(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// Event handler
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  // need to find the username from user array when submitted.
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';

    // removes the cursor from blinking in the input field
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

// Implementing Transfers
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  // looking for the account that has the username value we input into the form that we want to transfer to.
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    // check to see if amount is greater than 0, if the receiver account exists, if the balance of the current account has more money than the transfter amount, and then checking that the receiver account is not the same account as the current account
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer itself
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }

  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

// state variable
let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  // allows the whole thing to work, toggling back and forth between true and false.
  sorted = !sorted;
});

// console.log(createUsernames('Steven Thomas Williams')); // stw

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

/*
let arr = ['a', 'b', 'c', 'd', 'e'];

// SLICE
console.log(arr.slice(2)); // (3) ['c', 'd', 'e']
console.log(arr.slice(2, 4)); // (2) ['c', 'd']
console.log(arr.slice(-2)); // (2) ['d', 'e']
console.log(arr.slice(-1)); // ['e']
console.log(arr.slice(1, -2)); // (2) ['b', 'c']
console.log(arr.slice()); // (5) ['a', 'b', 'c', 'd', 'e']
console.log([...arr]); // (5) ['a', 'b', 'c', 'd', 'e']

// SPLICE
// console.log(arr.splice(2)); // (3) ['c', 'd', 'e']
arr.splice(-1);
console.log(arr); // ['a', 'b', 'c', 'd']
arr.splice(1, 2); // ['a', 'd']
console.log(arr); // (2)[('a', 'b')];

// REVERSE
arr = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse()); //  ['f', 'g', 'h', 'i', 'j']
console.log(arr2); // ['f', 'g', 'h', 'i', 'j']

// CONCAT
const letters = arr.concat(arr2);
console.log(letters); // (10) ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
console.log([...arr, ...arr2]); // (10) ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

// JOIN
console.log(letters.join(' - ')); // a - b - c - d - e - f - g - h - i - j
*/

///// Looping forEach

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// for (const movement of movements) {
// how we access the counter variable in the for/of loop
/*
for (const [i, movement] of movements.entries()) {
  if (movement > 0) {
    console.log(`Movement ${i + 1}: You deposited ${movement}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(movement)}`);
  }
}

console.log('---- FOREACH -----');
movements.forEach(function (movement, index, array) {
  if (movement > 0) {
    console.log(`Movement: ${index + 1}: You deposited ${movement}`);
  } else {
    console.log(`Movement: ${index + 1}: You withdrew ${Math.abs(movement)}`);
  }
});

// behind the scenes in iteration 0 calls an anonymous function without a name function(200)
// 1: function(450)
// 2: function(400)
// until it reaches the end of the array.
*/

//// Looping forEach with Maps and Sets
/*
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

currencies.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
});

// USD: United States dollar
// EUR: Euro
// GBP: Pound sterling

// Set
const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
console.log(currenciesUnique); // Set(3) {'USD', 'GBP', 'EUR'}
currenciesUnique.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
});

// USD: USD
// GBP: GBP
// EUR: EUR
*/

///////////////////////////////////////
// Coding Challenge #1

/* 
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy. A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.
Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:
1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")
4. Run the function for both test datasets
HINT: Use tools from all lectures in this section so far 😉
TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]
GOOD LUCK 😀
*/

/*
const checkDogs = function (dogsJulia, dogsKate) {
  const juliaCopy = dogsJulia.slice();
  juliaCopy.splice(0, 1);
  juliaCopy.splice(-2);
  // juliaCopy.slice(1, 3);
  const combinedArr = juliaCopy.concat(dogsKate);
  // console.log(combinedArr);
  combinedArr.forEach(function (dog, index) {
    if (dog <= 3) {
      console.log(`Dog number ${index + 1} is still a puppy 🐶`);
    } else {
      console.log(
        `Dog number ${index + 1} is an adult, and is ${dog} years old`
      );
    }
  });
};

checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
checkDogs([9, 16, 6, 8, 3], [10, 5, 6, 1, 4]);
*/

////// the map method
/*
const eurToUsd = 1.1;

const movementsUSD = movements.map(function (mov) {
  return mov * eurToUsd;
});

// Can simplify our callback function into one line of code
// const movementsUSD = movements.map(mov => mov * eurToUsd);

console.log(movements);
console.log(movementsUSD);

const movementsUSDfor = [];
for (const mov of movements) movementsUSDfor.push(mov * eurToUsd);
console.log(movementsUSDfor);

const movementsDescriptions = movements.map(
  (mov, i) =>
    `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
      mov
    )}`
);

console.log(movementsDescriptions);
*/

////////////////// Filter
/*
const deposits = movements.filter(function (mov) {
  return mov > 0;
});

console.log(movements);
console.log(deposits);

const depositsFor = [];
for (const mov of movements) if (mov > 0) depositsFor.push(mov);
console.log(depositsFor);

// const withdrawals = movements.filter(function (mov) {
//   return mov < 0;
// });

const withdrawals = movements.filter(mov => mov < 0);
console.log(withdrawals);
*/

///////// Reduce
/*
console.log(movements);

// accumulator -> SNOWBALL
// const balance = movements.reduce(function (acc, cur, i, arr) {
//   console.log(`Iteration ${i}: ${acc}`);
//   return acc + cur;
// }, 0);
// console.log(balance);

// rewritten as arrow function
const balance = movements.reduce((acc, cur) => acc + cur, 0);
console.log(balance);

let balance2 = 0;
for (const mov of movements) balance2 += mov;
console.log(balance2);

// Maximum value
const max = movements.reduce((acc, mov) => {
  if (acc > mov) return acc;
  else return mov;
}, movements[0]);
console.log(max);
*/

///////////////////////////////////////
// Coding Challenge #2

/* 
Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average age of the dogs in their study.
Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:
1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
4. Run the function for both test datasets
TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]
GOOD LUCK 😀
*/

/*
const calcAverageHumanAge = function (ages) {
  const humanAges = ages.map(age => (age <= 2 ? 2 * age : 16 + age * 4));
  const adults = humanAges.filter(age => age >= 18);
  console.log(humanAges);
  console.log(adults);

  const average = adults.reduce((acc, age) => acc + age, 0) / adults.length;
  // const average = adults.reduce(
  //   (acc, age, i, arr) => acc + age / arr.length,
  //   0
  // );

  // more complex way: 2, 3: (2 + 3)/2 = 2.5 === 2/2+3/2 = 2.5
  return average;
};

const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);

console.log(avg1, avg2);
*/

///////////////////////
// Magic of chaining methods together
/*

const eurToUsd = 1.1;
console.log(movements);

// PIPELINE
const totalDepositsUSD = movements
  .filter(mov => mov > 0)
  .map((mov, i, arr) => {
    // console.log(arr);
    return mov * eurToUsd;
  })
  .reduce((acc, mov) => acc + mov, 0);
console.log(totalDepositsUSD); // 5522.000000000001
*.

///////////////////////////////////////
// Coding Challenge #3

/* 
Rewrite the 'calcAverageHumanAge' function from the previous challenge, but this time as an arrow function, and using chaining!
TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]
GOOD LUCK 😀
*/

/*
const calcAverageHumanAge2 = function (ages) {
  const humanAges = ages
    .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
    .filter(age => age >= 18);
  const adults = humanAges.filter(age => age >= 18);

  const average = adults.reduce((acc, age) => acc + age, 0) / arr.length;
  return average;
};

const calcAverageHumanAge = ages =>
  ages
    .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
    .filter(age => age >= 18)
    .reduce((acc, age, i, arr) => acc + age / arr.length, 0);

const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
console.log(avg1, avg2);
*/

///////////////////////
// Find method
/*

const firstWithdrawal = movements.find(move => move < 0);
console.log(movements);
console.log(firstWithdrawal);

console.log(accounts);

const account = accounts.find(acc => acc.owner === 'Jessica Davis');
console.log(account);

for (const acct of accounts)
  if (acct.owner === 'Jessica Davis') console.log(acct);
  */

//////////////
// some and every
/*

console.log(movements);

// EQUALITY
console.log(movements.includes(-130));

// SOME: CONDITION
console.log(movements.some(mov => mov === -130));

const anyDeposits = movements.some(mov => mov > 0);
console.log(anyDeposits);

// EVERY
console.log(movements.every(mov => mov > 0)); // false
console.log(account4.movements.every(mov => mov > 0)); // true

// Separate Callback
const deposit = mov => mov > 0;
console.log(movements.some(deposit)); // true
console.log(movements.every(deposit)); // false
console.log(movements.filter(deposit)); // 5) [200, 450, 3000, 70, 1300]
*/

///////////////
// flat and flatMap
/*

const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
console.log(arr.flat()); // [1, 2, 3, 4, 5, 6, 7, 8]

const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
console.log(arrDeep.flat()); // (6) [Array(2), 3, 4, Array(2), 7, 8]
console.log(arrDeep.flat(2)); // (8) [1, 2, 3, 4, 5, 6, 7, 8]

const accountMovements = accounts.map(acc => acc.movements);
console.log(accountMovements);
const allMovements = accountMovements.flat();
console.log(allMovements); // (29) [200, 450, -400, 3000, -650, -130, 70, 1300, 5000, 3400, -150, -790, -3210, -1000, 8500, -30, 200, -200, 340, -300, -20, 50, 400, -460, 430, 1000, 700, 50, 90]
const overalBalance = allMovements.reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance); // 17840

// Chaining & Flat
const overalBalance2 = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance2);

// flatMap
const overalBalance3 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance3); // 17840
*/

//////////////////////////
// Sorting Arrays
/*
// Strings
const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
console.log(owners.sort());
console.log(owners);

// Numbers
console.log(movements); // (8) [200, 450, -400, 3000, -650, -130, 70, 1300]
// console.log(movements.sort()); // [-130, -400, -650, 1300, 200, 3000, 450, 70];

// return < 0, A, B (keep order)
// return > 0, B, A (switch order)
// movements.sort((a, b) => {
//   if (a > b) return 1;
//   if (b > a) return -1;
// });

movements.sort((a, b) => a - b);
console.log(movements); // [-650, -400, -130, 70, 200, 450, 1300, 3000]

// sort in descending order
// movements.sort((a, b) => {
//   if (a > b) return -1;
//   if (a < b) return 1;
// });
movements.sort((a, b) => b - a);
console.log(movements); // (8) [3000, 1300, 450, 200, 70, -130, -400, -650]
*/

////////////////////////////////////////////////////////
// More ways of Creating and Filling Arrays
/*
// Fill method
const arr = [1, 2, 3, 4, 5, 6, 7];
console.log(new Array(1, 2, 3, 4, 5, 6, 7));

// Empty arrays + fill method
const x = new Array(7);
console.log(x); // (7) [empty × 7]
// console.log(x.map(() => 5)); // (7) [empty × 7]

x.fill(1, 3, 5);
x.fill(1);
console.log(x);

arr.fill(23, 2, 6);
console.log(arr); // (7) [1, 2, 3, 4, 23, 23, 7]

// Array.from
const y = Array.from({ length: 7 }, () => 1);
console.log(y); // (7) [1, 1, 1, 1, 1, 1, 1]

// const z = Array.from({ length: 7 }, (cur, i) => i + 1);
const z = Array.from({ length: 7 }, (_, i) => i + 1);
console.log(z); // (7) [1, 2, 3, 4, 5, 6, 7]

const dice = Array.from({ length: 100 }, (_, i) =>
  Math.floor(Math.random() * 7)
);
console.log(dice);

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => Number(el.textContent.replace('€', ''))
  );
  console.log(movementsUI);

  const movementsUI2 = [...document.querySelectorAll('.movements__value')];
});
*/

///////////////////
// Array Practice Methods

// 1.
// Get all the movements out of the account array, flatten it, filter it for positive values, and then add all together.
// const bankDepostSum = accounts.map(acc => acc.movements).flat();
// can become:
/*
const bankDepostSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((sum, cur) => sum + cur, 0);

console.log(bankDepostSum);

// 2. Count how many deposits have been in the bank with at least $1000.
// One way of doing it:
// const numDeposits1000 = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov >= 1000).length;

const numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, cur) => (cur >= 1000 ? count + 1 : count), 0);
// .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);

// reduce always has the snowball, accumulator as first arg. in other example, it's previous sum + current value.
// in this case, our accumulator will be the number of movements that are > 1000. Start counting at 0. That initial value is like storing anything outside of a loop, where we keep storing a new value. That new value might very well be a counter where we update depending on position. What matters is that our reduce function here works. We can even use reduce to simply count something in an array. What's important to keep in mind, is we have this accumulator value outside (0), which we can use to reduce the array down to whatever we want. In this case it's a counter, but we can do anything. The count + 1, know there is an operator for simply adding 1. ++. But, it doesn't work. With the ++ operator

console.log(numDeposits1000);

// Prefixed ++ operator
let a = 10;
// console.log(a++); // 10
console.log(++a); // 11

// 3.
// const sums = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sums, cur) => {
//       cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
//       return sums;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );
// console.log(sums); // {deposits: 25180, withdrawals: -7340}

// destructure it immediately:
const { deposits, withdrawals } = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
      sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );
console.log(deposits, withdrawals); //  25180, -7340}

// 4.
// this is a nice title -> This is a Nice Title
const convertTitleCase = function (title) {
  const capitalize = str => str[0].toUpperCase() + str.slice(1);

  const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'on', 'in', 'with'];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitalize(word)))
    .join(' ');

  return capitalize(titleCase);
};
console.log(convertTitleCase('this is a nice title'));
console.log(convertTitleCase('this is a LONG title but not too long'));
console.log(convertTitleCase('and here is another title with an EXAMPLE'));
*/

///////////////////////////////////////
// Coding Challenge #4

/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).
1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. Do NOT create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)
HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.
TEST DATA:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] }
];
GOOD LUCK 😀
*/
/*

const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

// 1.
dogs.forEach(dog => (dog.recFood = Math.trunc(dog.weight ** 0.75 * 28)));

console.log(dogs);

// 2.
const sarahsDog = dogs.find(dog => dog.owners.includes('Sarah'));
console.log(sarahsDog);
console.log(
  `Sarah's dog is eating too ${
    sarahsDog.curFood > sarahsDog.recFood ? 'much' : 'little'
  }`
);

// 3.
const ownersEatTooMuch = dogs
  .filter(dog => dog.curFood > dog.recFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooMuch);

const ownersEatTooLittle = dogs
  .filter(dog => dog.curFood < dog.recFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooLittle);

// 4.
console.log(`${ownersEatTooMuch.join(' and ')}'s dogs each too much!`);
console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too little!`);

// 5.
console.log(dogs.some(dog => dog.curFood === dog.recFood));

// const checkEatingOkay = dog =>
//   dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1;

// 6.
console.log(
  dogs.some(
    dog => dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1
  )
);
// console.log(dogs.some(checkEatingOkay))

// 7.
const okayDogs = dogs.filter(
  dog => dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1
);
console.log(okayDogs);
// console.log(dogs.filter(checkEatingOkay))

// 8.
// const dogsCopy = dogs.slice().sort((a, b) => {
//   if (a.recFood > b.recFood) return 1;
//   if (b.recFood > a.recFood) return -1;
// });

const dogsCopy = dogs.slice().sort((a, b) => a.recFood - b.recFood);
console.log(dogsCopy);
*/

///////// At method

const arr = [23, 11, 64];
console.log(arr[0]);
console.log(arr.at(0));

// Two traditional ways of getting the last element.
console.log(arr[arr.length - 1]);
console.log(arr.slice(-1)[0]);
console.log(arr.at(-1));

console.log('jonas'.at(0)); // j
console.log('jonas'.at(-1)); // s
